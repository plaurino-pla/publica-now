import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get creator membership
    const memberships = await prisma.$queryRaw`
      SELECT "creatorId" FROM memberships 
      WHERE "userId" = ${userId} 
      AND role = 'owner'
      LIMIT 1
    `

    const membership = (memberships as any[])[0]
    if (!membership) {
      return NextResponse.json({ error: 'Creator account not found' }, { status: 404 })
    }

    const creatorId = membership.creatorId

    // Get articles for analytics
    const articles = await prisma.$queryRaw`
      SELECT 
        id, title, status, visibility, pricing, "createdAt", "publishedAt",
        "coverUrl", "bodyMarkdown", "imageUrls", "audioUrl", "videoId"
      FROM articles 
      WHERE "creatorId" = ${creatorId}
      AND status IN ('ready', 'published')
      ORDER BY "createdAt" DESC
    `

    // Get subscriptions count
    const subscriptions = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM memberships 
      WHERE "creatorId" = ${creatorId} 
      AND role = 'subscriber'
    `

    // Calculate analytics from real data
    const totalArticles = (articles as any[]).length
    const publishedArticles = (articles as any[]).filter(a => a.status === 'published').length
    const paidArticles = (articles as any[]).filter(a => a.visibility === 'paid').length
    const totalSubscribers = (subscriptions as any[])[0]?.count || 0

    // Calculate monthly data for the last 6 months
    const monthlyData = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)
      
      const monthArticles = (articles as any[]).filter(article => {
        const articleDate = new Date(article.createdAt)
        return articleDate >= monthStart && articleDate <= monthEnd
      })
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        articles: monthArticles.length,
        revenue: monthArticles
          .filter(a => a.visibility === 'paid' && a.pricing)
          .reduce((sum, a) => {
            try {
              const pricing = typeof a.pricing === 'string' ? JSON.parse(a.pricing) : a.pricing
              return sum + (pricing?.USD || 0)
            } catch {
              return sum
            }
          }, 0)
      })
    }

    const analyticsData = {
      totalArticles,
      publishedArticles,
      paidArticles,
      totalSubscribers,
      totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
      monthlyData,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
