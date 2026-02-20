import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { z } from 'zod'

const updateArticleSchema = z.object({
  title: z.string().min(1),
  coverUrl: z.string().optional().nullable(),
  bodyMarkdown: z.string().min(1),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['free', 'paid', 'subscribers']).default('paid'),
  pricing: z.record(z.number()).optional(),
})

function sanitizeCoverUrl(value?: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  try {
    const u = new URL(trimmed)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString()
  } catch {}
  return undefined
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's creator membership using raw SQL
    const memberships = await prisma.$queryRaw`
      SELECT m."creatorId", c.id as "creatorId", c.name as "creatorName"
      FROM memberships m
      JOIN creators c ON m."creatorId" = c.id
      WHERE m."userId" = ${session.user.id} 
      AND m.role = 'owner'
      LIMIT 1
    `

    const membership = (memberships as any[])[0]

    if (!membership) {
      return NextResponse.json({ error: 'No creator space' }, { status: 403 })
    }

    // Get article using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a.slug, a."bodyMarkdown", a."contentType", 
        a."coverUrl", a.tags, a.visibility, a.pricing, a.status,
        a."audioUrl", a."videoUrl", a."videoId", a."imageUrls",
        a."publishedAt", a."createdAt", a."updatedAt"
      FROM articles a
      WHERE a.id = ${params.id}
      AND a."creatorId" = ${membership.creatorId}
      LIMIT 1
    `

    const article = (articles as any[])[0]

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Parse pricing JSON string to object for frontend
    const articleWithParsedPricing = {
      ...article,
      pricing: article.pricing || null,
    }

    return NextResponse.json(articleWithParsedPricing)
  } catch (err: any) {
    console.error('Get article error:', err)
    return NextResponse.json({ error: 'Failed to get article' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's creator membership using raw SQL
    const memberships = await prisma.$queryRaw`
      SELECT m."creatorId", c.id as "creatorId", c.name as "creatorName"
      FROM memberships m
      JOIN creators c ON m."creatorId" = c.id
      WHERE m."userId" = ${session.user.id} 
      AND m.role = 'owner'
      LIMIT 1
    `

    const membership = (memberships as any[])[0]

    if (!membership) {
      return NextResponse.json({ error: 'No creator space' }, { status: 403 })
    }

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const data = updateArticleSchema.parse(body)

    // Check if article exists and belongs to the creator using raw SQL
    const existingArticles = await prisma.$queryRaw`
      SELECT id FROM articles 
      WHERE id = ${params.id}
      AND "creatorId" = ${membership.creatorId}
      LIMIT 1
    `

    const existingArticle = (existingArticles as any[])[0]

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Update the article using raw SQL
    const updatedArticles = await prisma.$queryRaw`
      UPDATE articles 
      SET title = ${data.title},
          "coverUrl" = ${sanitizeCoverUrl(data.coverUrl ?? undefined)},
          "bodyMarkdown" = ${data.bodyMarkdown},
          tags = ${data.tags ? data.tags.join(',') : null},
          visibility = ${data.visibility},
          pricing = ${JSON.stringify(data.pricing || { USD: 9.99 })},
          "updatedAt" = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    const updatedArticle = (updatedArticles as any[])[0]

    return NextResponse.json(updatedArticle)
  } catch (err: any) {
    console.error('Update article error:', err)
    if (err?.issues) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}
