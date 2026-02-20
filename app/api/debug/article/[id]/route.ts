import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get article using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a."contentType", a."audioUrl", a.pricing, a.status, a."publishedAt",
        c.id as "creatorId", c.name as "creatorName", c.slug as "creatorSlug"
      FROM articles a
      JOIN creators c ON a."creatorId" = c.id
      WHERE a.id = ${params.id}
      LIMIT 1
    `

    if ((articles as any[]).length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = (articles as any[])[0]

    return NextResponse.json({
      id: article.id,
      title: article.title,
      contentType: article.contentType,
      audioUrl: article.audioUrl,
      pricing: article.pricing,
      status: article.status,
      publishedAt: article.publishedAt,
      creator: {
        id: article.creatorId,
        name: article.creatorName,
        slug: article.creatorSlug
      }
    })

  } catch (error) {
    console.error('Debug article error:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}
