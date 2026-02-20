import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { publicaId, readerUrl } = body

    if (!publicaId || !readerUrl) {
      return NextResponse.json({ error: 'Publica.la ID and reader URL are required' }, { status: 400 })
    }

    // Find the article by slug using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.slug, a.title, a.pricing, a."creatorId"
      FROM articles a
      WHERE a.slug = ${params.id} AND a."contentType" = 'audio'
      LIMIT 1
    `

    if ((articles as any[]).length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = (articles as any[])[0]

    // Check if user has creator membership using raw SQL
    const memberships = await prisma.$queryRaw`
      SELECT id FROM memberships 
      WHERE "userId" = ${req.headers.get('user-id') || 'unknown'}
      AND "creatorId" = ${article.creatorId}
      AND role = 'owner'
      LIMIT 1
    `

    if ((memberships as any[]).length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the article with the publica.la ID and reader URL using raw SQL
    const currentPricing = article.pricing || {}
    const updatedPricing = {
      ...currentPricing,
      publica: {
        id: publicaId,
        externalId: `audio-${article.id}`,
        readerUrl: readerUrl,
        status: 'published',
        sentAt: new Date().toISOString()
      }
    }

    await prisma.$queryRaw`
      UPDATE articles 
      SET pricing = ${JSON.stringify(updatedPricing)}
      WHERE id = ${article.id}
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Article updated with publica.la ID and reader URL successfully', 
      articleId: article.id,
      slug: article.slug,
      title: article.title,
      publicaId: publicaId,
      readerUrl: readerUrl,
      updatedPricing: updatedPricing
    })

  } catch (error) {
    console.error('Error updating article with publica.la data:', error)
    return NextResponse.json({ 
      error: 'Failed to update article', 
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
