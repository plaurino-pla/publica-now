import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get full article data using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a.slug, a."bodyMarkdown", a."contentType", 
        a."audioUrl", a.pricing, a.status, a."publishedAt",
        c.id as "creatorId", c.name as "creatorName", c.slug as "creatorSlug", c.branding
      FROM articles a
      JOIN creators c ON a."creatorId" = c.id
      WHERE a.id = ${params.id}
      LIMIT 1
    `

    if ((articles as any[]).length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = (articles as any[])[0]

    // Get artifacts using raw SQL
    const artifacts = await prisma.$queryRaw`
      SELECT id, "epubUrl", version, theme
      FROM artifacts
      WHERE "articleId" = ${article.id}
      ORDER BY version DESC
    `

    const currentArtifact = (artifacts as any[])[0] || null

    // Check if bodyMarkdown is actually null or just empty
    const bodyMarkdownStatus = article.bodyMarkdown 
      ? `Present (${article.bodyMarkdown.length} chars)` 
      : 'NULL or undefined'

    // Check if slug is actually null or just empty
    const slugStatus = article.slug 
      ? `Present: "${article.slug}"` 
      : 'NULL or undefined'

    return NextResponse.json({
      success: true,
      article: {
        ...article,
        currentArtifact,
        artifacts: artifacts as any[],
        creator: {
          id: article.creatorId,
          name: article.creatorName,
          slug: article.creatorSlug,
          branding: article.branding
        }
      },
      debug: {
        bodyMarkdownStatus,
        slugStatus,
        hasCurrentArtifact: !!currentArtifact,
        artifactsCount: (artifacts as any[]).length
      }
    })

  } catch (error) {
    console.error('Debug article error:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}
