import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PublicaClient } from '@/lib/publica'
import { EpubGenerator } from '@/lib/epub-generator'
import { put } from '@vercel/blob'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const publicaTextSchema = z.object({
  articleId: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  visibility: z.enum(['free', 'paid', 'subscribers']),
  pricing: z.record(z.number()).optional(),
  coverImage: z.string().optional(), // Base64 encoded image
  userHeaderImage: z.string().optional(), // User's header image as fallback
})

export async function POST(req: NextRequest) {
  try {
    console.log('=== PUBLICA.LA API ROUTE START ===')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Session validated, user ID:', session.user.id)

    const body = await req.json()
    console.log('Request body received:', { 
      articleId: body.articleId, 
      title: body.title,
      contentLength: body.content?.length,
      hasCoverImage: !!body.coverImage,
      hasUserHeaderImage: !!body.userHeaderImage
    })
    
    const data = publicaTextSchema.parse(body)
    console.log('Data validation passed')

    // Get article and creator info using raw SQL
    console.log('Executing raw SQL query for article...')
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a."contentType", a.pricing, a.status,
        c.id as "creatorId", c.name as "creatorName", c.slug as "creatorSlug"
      FROM articles a
      JOIN creators c ON a."creatorId" = c.id
      JOIN memberships m ON c.id = m."creatorId"
      WHERE a.id = ${data.articleId} 
      AND a."contentType" = 'text'
      AND m."userId" = ${session.user.id}
      AND m.role = 'owner'
      LIMIT 1
    `
    console.log('Raw SQL query completed, results:', articles)

    const article = (articles as any[])[0]
    if (!article) {
      console.log('No article found or access denied')
      return NextResponse.json({ error: 'Article not found or access denied' }, { status: 404 })
    }
    
    console.log('Article found:', { 
      id: article.id, 
      contentType: article.contentType,
      status: article.status,
      creatorId: article.creatorId,
      creatorName: article.creatorName
    })

    const creator = {
      id: article.creatorId,
      name: article.creatorName,
      slug: article.creatorSlug
    }
    console.log('Creator object constructed:', creator)

    // Use global publica.la configuration
    const globalApiToken = process.env.PUBLICA_API_TOKEN || 'api-b058d4d5-26c5-41ac-8f41-ed0bfe5fa696'
    const globalStoreDomain = process.env.PUBLICA_STORE_DOMAIN || 'plaurino.publica.la'

    if (!globalApiToken || !globalStoreDomain) {
      console.log('Publica.la configuration not found')
      return NextResponse.json({ error: 'Publica.la configuration not found' }, { status: 500 })
    }

    console.log('Using global publica.la configuration:', {
      storeDomain: globalStoreDomain,
      apiToken: globalApiToken ? '***' + globalApiToken.slice(-4) : 'NOT_SET'
    })

    console.log('Generating EPUB for text article:', { 
      title: data.title,
      creator: creator.name,
      contentLength: data.content.length,
      hasCoverImage: !!data.coverImage,
      hasUserHeaderImage: !!data.userHeaderImage
    })

    // Determine which cover image to use
    let coverImageToUse = data.coverImage
    if (!coverImageToUse && data.userHeaderImage) {
      coverImageToUse = data.userHeaderImage
      console.log('Using user header image as EPUB cover fallback')
    }
    
    // If still no cover image, use default JPG fallback
    if (!coverImageToUse) {
      // Use a simple base64-encoded JPG fallback
      coverImageToUse = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      console.log('Using default JPG cover image as EPUB cover fallback')
    }

    // Generate EPUB from text content
    console.log('Starting EPUB generation...')
    const epubGenerator = new EpubGenerator()
    const epubBlob = await epubGenerator.generateEpub({
      title: data.title,
      author: creator.name,
      description: data.description,
      content: data.content,
      language: 'en',
      publicationDate: new Date().toISOString().slice(0, 10),
      coverImage: coverImageToUse
    })
    console.log('EPUB generation completed successfully, size:', epubBlob.size || 'unknown')

    console.log('EPUB generated, uploading to Vercel Blob...')

    // Upload EPUB to Vercel Blob
    const timestamp = Date.now()
    const filename = `epubs/${session.user.id}/${timestamp}.epub`
    
    const blob = await put(filename, epubBlob, {
      access: 'public',
      addRandomSuffix: false,
    })

    console.log('EPUB uploaded to Blob successfully:', blob.url)

    // Send to publica.la API
    const publica = new PublicaClient(globalStoreDomain, globalApiToken)
    const externalId = `text-${article.id}-${Date.now()}`

    console.log('Sending text article to publica.la:', { 
      name: data.title, 
      external_id: externalId, 
      file_url: blob.url, 
      description: data.description,
      storeDomain: globalStoreDomain,
      apiToken: globalApiToken ? '***' + globalApiToken.slice(-4) : 'NOT_SET'
    })

    const publicaResponse = await publica.createContent({
      name: data.title,
      publication_date: new Date().toISOString().slice(0, 10),
      extension: 'epub',
      file_url: blob.url,
      external_id: externalId,
      prices: data.pricing && data.pricing.USD ? data.pricing : undefined,
      description: data.description,
      lang: 'en',
      author: [creator.name],
      keyword: ['text', 'article', 'publica-now'],
      free: !data.pricing || !data.pricing.USD, // Only free if no pricing or USD is 0/null
    })

    console.log('Publica.la response:', publicaResponse)

    if (!publicaResponse || !publicaResponse.id || !publicaResponse.reader_url) {
      console.log('Invalid response from publica.la API - missing ID or reader URL')
      throw new Error('Invalid response from publica.la API - missing ID or reader URL')
    }

    // Update the article with publica.la metadata using raw SQL
    await prisma.$executeRawUnsafe(`
      UPDATE articles 
      SET 
        status = 'published',
        "publishedAt" = NOW(),
        pricing = $1::jsonb
      WHERE id = $2
    `, JSON.stringify({
      ...(article.pricing || {}),
      publica: {
        id: publicaResponse.id,
        externalId: publicaResponse.external_id,
        readerUrl: publicaResponse.reader_url,
        epubUrl: blob.url, // Store the actual EPUB file URL
        status: 'published',
        sentAt: new Date().toISOString()
      }
    }), data.articleId)

    console.log('Article updated with publica.la metadata:', {
      articleId: data.articleId,
      publicaId: publicaResponse.id,
      externalId: publicaResponse.external_id,
      readerUrl: publicaResponse.reader_url
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Text article sent to publica.la successfully', 
      publicaId: publicaResponse.id, 
      publicaExternalId: publicaResponse.external_id,
      readerUrl: publicaResponse.reader_url,
      epubUrl: blob.url,
      articleId: data.articleId 
    })

  } catch (error) {
    console.error('Error sending text article to publica.la:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? (error as any).cause : undefined
    })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to send text article to publica.la', 
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? {
        name: error.name,
        stack: error.stack,
        cause: (error as any).cause
      } : 'No error details available'
    }, { status: 500 })
  }
}
