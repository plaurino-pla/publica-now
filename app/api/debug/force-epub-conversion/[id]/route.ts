import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PublicaClient } from '@/lib/publica'
import { EpubGenerator } from '@/lib/epub-generator'
import { put } from '@vercel/blob'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Force EPUB conversion for article:', params.id)

    // Find the article
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: { creator: true }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    if (article.contentType !== 'text') {
      return NextResponse.json({ error: 'Article is not a text article' }, { status: 400 })
    }

    console.log('Article found:', {
      title: article.title,
      creator: article.creator.name,
      contentLength: article.bodyMarkdown?.length || 0
    })

    // Use global publica.la configuration
    const globalApiToken = process.env.PUBLICA_API_TOKEN || 'api-b058d4d5-26c5-41ac-8f41-ed0bfe5fa696'
    const globalStoreDomain = process.env.PUBLICA_STORE_DOMAIN || 'plaurino.publica.la'

    if (!globalApiToken || !globalStoreDomain) {
      return NextResponse.json({ error: 'Publica.la configuration not found' }, { status: 500 })
    }

    // Generate EPUB
    console.log('Generating EPUB...')
    const epubGenerator = new EpubGenerator()
    const epubBlob = await epubGenerator.generateEpub({
      title: article.title,
      author: article.creator.name,
      description: article.bodyMarkdown?.substring(0, 200) + '...' || 'Text article',
      content: article.bodyMarkdown || '',
      language: 'es', // Spanish content
      publicationDate: new Date().toISOString().slice(0, 10),
      coverImage: undefined // No cover image for now
    })

    console.log('EPUB generated, uploading to Vercel Blob...')

    // Upload EPUB to Vercel Blob
    const timestamp = Date.now()
    const filename = `epubs/debug/${article.id}/${timestamp}.epub`
    
    const blob = await put(filename, epubBlob, {
      access: 'public',
      addRandomSuffix: false,
    })

    console.log('EPUB uploaded to Blob:', blob.url)

    // Send to publica.la API
    const publica = new PublicaClient(globalStoreDomain, globalApiToken)
    const externalId = `text-${article.id}-${Date.now()}`

    console.log('Sending to publica.la...')
    const publicaResponse = await publica.createContent({
      name: article.title,
      external_id: externalId,
      file_url: blob.url,
      description: article.bodyMarkdown?.substring(0, 200) + '...' || 'Text article',
      extension: 'epub',
      publication_date: new Date().toISOString().slice(0, 10),
      prices: (article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing) ? { USD: (article.pricing as any).USD } : undefined
    })

    console.log('Publica.la response:', publicaResponse)

    if (!publicaResponse || !publicaResponse.id) {
      throw new Error('Invalid response from publica.la')
    }

    // Update article with publica.la metadata
    const updatedArticle = await prisma.article.update({
      where: { id: article.id },
      data: {
        pricing: {
          ...(article.pricing && typeof article.pricing === 'object' ? article.pricing : {}),
          publica: {
            id: publicaResponse.id,
            externalId: publicaResponse.external_id,
            readerUrl: publicaResponse.reader_url,
            epubUrl: blob.url,
            sentAt: new Date().toISOString()
          }
        },
        status: 'published',
        publishedAt: new Date()
      }
    })

    console.log('Article updated successfully')

    return NextResponse.json({
      success: true,
      message: 'EPUB conversion completed successfully',
      article: {
        id: updatedArticle.id,
        title: updatedArticle.title,
        status: updatedArticle.status,
        publishedAt: updatedArticle.publishedAt,
        publica: {
          id: publicaResponse.id,
          externalId: publicaResponse.external_id,
          readerUrl: publicaResponse.reader_url,
          epubUrl: blob.url
        }
      }
    })

  } catch (error) {
    console.error('Error in force EPUB conversion:', error)
    return NextResponse.json(
      { 
        error: 'Failed to convert to EPUB', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
