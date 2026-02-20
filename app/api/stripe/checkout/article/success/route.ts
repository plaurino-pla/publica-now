import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Get article details using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a.slug, a."creatorId", a.pricing,
        c.slug as "creatorSlug"
      FROM articles a
      JOIN creators c ON a."creatorId" = c.id
      WHERE a.id = ${articleId}
      LIMIT 1
    `

    const article = (articles as any[])[0]

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if purchase already exists using raw SQL
    const existingPurchases = await prisma.$queryRaw`
      SELECT id FROM purchases 
      WHERE "userId" = ${session.user.id} 
      AND "articleId" = ${articleId}
      LIMIT 1
    `

    const existingPurchase = (existingPurchases as any[])[0]

    if (existingPurchase) {
      // Update existing purchase status using raw SQL
      await prisma.$queryRaw`
        UPDATE purchases 
        SET status = 'completed'
        WHERE id = ${existingPurchase.id}
      `
    } else {
      // Create new purchase record using raw SQL
      await prisma.$queryRaw`
        INSERT INTO purchases (
          "userId", "articleId", amount, currency, status, "createdAt", "updatedAt"
        )
        VALUES (
          ${session.user.id}, ${articleId}, ${article.pricing?.USD ? article.pricing.USD * 100 : 500}, 
          'usd', 'completed', NOW(), NOW()
        )
      `
    }

    // Redirect to the article page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/${article.creatorSlug}/content/${article.slug}`)

  } catch (error) {
    console.error('Error handling article purchase success:', error)
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    )
  }
}
