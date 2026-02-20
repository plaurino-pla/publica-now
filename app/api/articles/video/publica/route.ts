import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PublicaClient } from '@/lib/publica'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const publicaVideoSchema = z.object({
  articleId: z.string(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string(),
  videoId: z.string().optional(),
  visibility: z.enum(['free', 'paid', 'subscribers']),
  pricing: z.record(z.number()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = publicaVideoSchema.parse(body)

    // Get article and creator info using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT
        a.id, a."contentType", a.pricing, a.status, a."videoUrl", a."videoId",
        c.id as "creatorId", c.name as "creatorName", c.slug as "creatorSlug"
      FROM articles a
      JOIN creators c ON a."creatorId" = c.id
      JOIN memberships m ON c.id = m."creatorId"
      WHERE a.id = ${data.articleId}
      AND a."contentType" = 'video'
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
    const apiToken = process.env.PUBLICA_API_TOKEN
    const storeDomain = process.env.PUBLICA_STORE_DOMAIN || ''
    if (!apiToken || !storeDomain) {
      return NextResponse.json({ error: 'Publica.la configuration missing' }, { status: 500 })
    }

    const publica = new PublicaClient(storeDomain, apiToken)
    const externalId = `video-${article.id}-${Date.now()}`

    console.log('Sending video to publica.la:', {
      name: data.title,
      external_id: externalId,
      file_url: data.videoUrl,
      storeDomain,
    })

    const publicaResponse = await publica.createContent({
      name: data.title,
      publication_date: new Date().toISOString().slice(0, 10),
      extension: 'mp4',
      file_url: data.videoUrl,
      external_id: externalId,
      prices: data.pricing && data.pricing.USD ? data.pricing : undefined,
      description: data.description,
      lang: 'en',
      author: [creator.name],
      keyword: ['video', 'publica-now'],
      free: !data.pricing || !data.pricing.USD,
    })

    console.log('Publica.la response:', publicaResponse)

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
      message: 'Video sent to publica.la successfully',
      publicaId: publicaResponse.id,
      publicaExternalId: publicaResponse.external_id,
      readerUrl: publicaResponse.reader_url,
      articleId: data.articleId
    })

  } catch (error) {
    console.error('Error sending video to publica.la:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({
      error: 'Failed to send video to publica.la',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
