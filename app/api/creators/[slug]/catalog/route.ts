import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get creator using raw SQL
    const creators = await prisma.$queryRaw`
      SELECT id, name, slug, "storeDomain", "createdAt"
      FROM creators
      WHERE slug = ${params.slug}
      LIMIT 1
    `

    if ((creators as any[]).length === 0) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const creator = (creators as any[])[0]

    // Get articles using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        id, title, slug, "contentType", status, visibility, "coverUrl", 
        tags, pricing, "publishedAt", "createdAt"
      FROM articles
      WHERE "creatorId" = ${creator.id}
      AND status IN ('ready', 'published')
      ORDER BY CASE WHEN "publishedAt" IS NOT NULL THEN "publishedAt" ELSE "createdAt" END DESC
    `

    return NextResponse.json({
      creator: {
        id: creator.id,
        name: creator.name,
        slug: creator.slug,
        storeDomain: creator.storeDomain
      },
      articles: articles as any[]
    })
  } catch (error) {
    console.error('Error fetching catalog:', error)
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 })
  }
}
