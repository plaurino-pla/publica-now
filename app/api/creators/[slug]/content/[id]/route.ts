import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
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

    // Get article using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        id, title, slug, "bodyMarkdown", "contentType", "coverUrl", tags, 
        pricing, "audioUrl", "videoId", "publishedAt", "createdAt"
      FROM articles
      WHERE slug = ${params.id} AND "creatorId" = ${creator.id}
      LIMIT 1
    `

    if ((articles as any[]).length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = (articles as any[])[0]

    return NextResponse.json({
      article: {
        ...article,
        creator: {
          id: creator.id,
          name: creator.name,
          slug: creator.slug,
          storeDomain: creator.storeDomain
        }
      }
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}
