import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PublicaClient } from '@/lib/publica'
import { uploadBufferToTempService } from '@/lib/upload'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const publicaImageSchema = z.object({
  articleId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  visibility: z.enum(['free', 'paid', 'subscribers']).optional(),
  pricing: z.record(z.number()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = publicaImageSchema.parse(body)

    // Get article and creator info using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a."contentType", a.pricing, a.status, a."imageUrls", a."bodyMarkdown",
        c.id as "creatorId", c.name as "creatorName", c.slug as "creatorSlug"
      FROM articles a
      JOIN creators c ON a."creatorId" = c.id
      JOIN memberships m ON c.id = m."creatorId"
      WHERE a.id = ${data.articleId} 
      AND a."contentType" = 'image'
      AND m."userId" = ${session.user.id}
      AND m.role = 'owner'
      LIMIT 1
    `

    const article = (articles as any[])[0]
    if (!article) {
      return NextResponse.json({ error: 'Article not found or access denied' }, { status: 404 })
    }

    if (!article.imageUrls || !Array.isArray(article.imageUrls) || article.imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images found for this article' }, { status: 400 })
    }

    console.log('=== IMAGE PDF GENERATION START ===')
    console.log('Article ID:', data.articleId)
    console.log('Image URLs found:', article.imageUrls)
    console.log('Number of images:', article.imageUrls.length)
    console.log('Image URLs type:', typeof article.imageUrls)
    console.log('Image URLs is array:', Array.isArray(article.imageUrls))
    console.log('Raw imageUrls data:', JSON.stringify(article.imageUrls, null, 2))

    // Ensure imageUrls is properly formatted as an array
    let imageUrlsArray: string[] = []
    if (Array.isArray(article.imageUrls)) {
      imageUrlsArray = article.imageUrls
    } else if (typeof article.imageUrls === 'string') {
      // Handle case where imageUrls might be stored as a JSON string
      try {
        imageUrlsArray = JSON.parse(article.imageUrls)
        console.log('Parsed imageUrls from JSON string:', imageUrlsArray)
      } catch (e) {
        console.error('Failed to parse imageUrls as JSON:', e)
        imageUrlsArray = [article.imageUrls] // Treat as single image
      }
    } else {
      console.error('Unexpected imageUrls format:', article.imageUrls)
      return NextResponse.json({ error: 'Invalid imageUrls format' }, { status: 400 })
    }

    console.log('Final imageUrlsArray:', imageUrlsArray)
    console.log('Final array length:', imageUrlsArray.length)

    if (imageUrlsArray.length === 0) {
      return NextResponse.json({ error: 'No valid image URLs found' }, { status: 400 })
    }

    // Build a single PDF from image URLs
    const { PDFDocument } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.create()
    
    let processedImages = 0
    let failedImages = 0

    for (let i = 0; i < imageUrlsArray.length; i++) {
      const url = imageUrlsArray[i]
      console.log(`Processing image ${i + 1}/${imageUrlsArray.length}:`, url)
      
      try {
        const res = await fetch(url)
        if (!res.ok) {
          console.warn(`Failed to fetch image ${i + 1}:`, url, 'Status:', res.status)
          failedImages++
          continue
        }
        
        const arr = new Uint8Array(await res.arrayBuffer())
        console.log(`Image ${i + 1} fetched successfully, size:`, arr.length, 'bytes')
        
        let img
        if (url.toLowerCase().endsWith('.png')) {
          img = await pdfDoc.embedPng(arr)
          console.log(`Image ${i + 1} embedded as PNG`)
        } else {
          img = await pdfDoc.embedJpg(arr)
          console.log(`Image ${i + 1} embedded as JPG`)
        }
        
        const { width, height } = img.size()
        console.log(`Image ${i + 1} dimensions:`, width, 'x', height)
        
        const page = pdfDoc.addPage([width, height])
        page.drawImage(img, { x: 0, y: 0, width, height })
        console.log(`Image ${i + 1} added to PDF page ${i + 1}`)
        
        processedImages++
      } catch (e) {
        console.error(`Error processing image ${i + 1}:`, url, e)
        failedImages++
      }
    }

    console.log(`PDF generation completed. Processed: ${processedImages}, Failed: ${failedImages}`)
    console.log(`Total PDF pages: ${pdfDoc.getPageCount()}`)

    if (processedImages === 0) {
      return NextResponse.json({ error: 'Failed to process any images for PDF generation' }, { status: 500 })
    }

    const pdfBytes = await pdfDoc.save()
    console.log('PDF saved, size:', pdfBytes.length, 'bytes')

    // Upload PDF to temporary/public storage to obtain a URL
    const fileUrl = await uploadBufferToTempService(`images-${article.id}.pdf`, Buffer.from(pdfBytes))

    // Prepare publica.la client
    const apiToken = process.env.PUBLICA_API_TOKEN
    const storeDomain = process.env.PUBLICA_STORE_DOMAIN || process.env.PUBLICA_TENANT_URL || ''
    if (!apiToken || !storeDomain) {
      return NextResponse.json({ error: 'Publica.la configuration missing' }, { status: 500 })
    }

    const publica = new PublicaClient(storeDomain, apiToken)
    const externalId = `image-${article.id}-${Date.now()}`

    const publicaResponse = await publica.createContent({
      name: data.title || article.title,
      publication_date: new Date().toISOString().slice(0, 10),
      extension: 'pdf',
      file_url: fileUrl,
      external_id: externalId,
      prices: data.pricing && data.pricing.USD ? data.pricing : undefined,
      description: data.description || article.bodyMarkdown?.slice(0, 200) || 'Image collection',
      lang: 'en',
      author: [article.creatorName],
      keyword: ['image', 'gallery', 'publica-now'],
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
        status: 'published',
        sentAt: new Date().toISOString()
      }
    }), data.articleId)

    return NextResponse.json({
      success: true,
      message: 'Images compiled to PDF and sent to publica.la',
      publicaId: publicaResponse.id,
      readerUrl: publicaResponse.reader_url,
      articleId: data.articleId
    })

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error sending images to publica.la:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Failed to send images to publica.la',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? {
        name: error.name,
        stack: error.stack,
        cause: (error as any).cause
      } : 'No error details available'
    }, { status: 500 })
  }
}


