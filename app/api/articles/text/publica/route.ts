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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = publicaTextSchema.parse(body)

    // Get article and creator info using raw SQL
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
    const article = (articles as any[])[0]
    if (!article) {
      return NextResponse.json({ error: 'Article not found or access denied' }, { status: 404 })
    }

    const creator = {
      id: article.creatorId,
      name: article.creatorName,
      slug: article.creatorSlug
    }

    // Use global publica.la configuration
    const globalApiToken = process.env.PUBLICA_API_TOKEN || 'api-b058d4d5-26c5-41ac-8f41-ed0bfe5fa696'
    const globalStoreDomain = process.env.PUBLICA_STORE_DOMAIN || 'plaurino.publica.la'

    if (!globalApiToken || !globalStoreDomain) {
      return NextResponse.json({ error: 'Publica.la configuration not found' }, { status: 500 })
    }

    // Determine which cover image to use
    let coverImageToUse = data.coverImage
    if (!coverImageToUse && data.userHeaderImage) {
      coverImageToUse = data.userHeaderImage
    }
    
    // If still no cover image, use default JPG fallback
    if (!coverImageToUse) {
      // Use a simple base64-encoded JPG fallback
      coverImageToUse = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    }

    // Generate EPUB from text content
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

    // Upload EPUB to Vercel Blob
    const timestamp = Date.now()
    const filename = `epubs/${session.user.id}/${timestamp}.epub`
    
    const blob = await put(filename, epubBlob, {
      access: 'public',
      addRandomSuffix: false,
    })

    // Send to publica.la API
    const publica = new PublicaClient(globalStoreDomain, globalApiToken)
    const externalId = `text-${article.id}-${Date.now()}`

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

    if (!publicaResponse || !publicaResponse.id || !publicaResponse.reader_url) {
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
