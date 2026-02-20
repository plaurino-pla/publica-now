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

    // Get articles with pricing data
    const articles = await prisma.$queryRaw`
      SELECT 
        id, title, status, visibility, pricing, "createdAt", "publishedAt"
      FROM articles 
      WHERE "creatorId" = ${creatorId}
      AND status IN ('ready', 'published')
      AND visibility = 'paid'
      ORDER BY "createdAt" DESC
    `

    // Get subscriptions for revenue calculation
    const subscriptions = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM memberships 
      WHERE "creatorId" = ${creatorId} 
      AND role = 'subscriber'
    `

    const totalSubscribers = (subscriptions as any[])[0]?.count || 0

    // Calculate earnings from paid articles
    const calculateArticleRevenue = (article: any) => {
      try {
        const pricing = typeof article.pricing === 'string' ? JSON.parse(article.pricing) : article.pricing
        return pricing?.USD || 0
      } catch {
        return 0
      }
    }

    const totalArticleRevenue = (articles as any[]).reduce((sum, article) => {
      return sum + calculateArticleRevenue(article)
    }, 0)

    // Calculate monthly earnings for the last 6 months
    const monthlyEarnings = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)
      
      const monthArticles = (articles as any[]).filter(article => {
        const articleDate = new Date(article.createdAt)
        return articleDate >= monthStart && articleDate <= monthEnd
      })
      
      const monthRevenue = monthArticles.reduce((sum, article) => {
        return sum + calculateArticleRevenue(article)
      }, 0)
      
      monthlyEarnings.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue,
        articles: monthArticles.length
      })
    }

    // Calculate current month and last month earnings
    const currentMonth = monthlyEarnings[monthlyEarnings.length - 1]?.revenue || 0
    const lastMonth = monthlyEarnings[monthlyEarnings.length - 2]?.revenue || 0

    // Calculate pending payout (85% of total earnings after 15% platform fee)
    const platformFee = 0.15
    const totalEarnings = totalArticleRevenue * (1 - platformFee)
    const pendingPayout = totalEarnings

    const earningsData = {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      thisMonth: parseFloat(currentMonth.toFixed(2)),
      lastMonth: parseFloat(lastMonth.toFixed(2)),
      pendingPayout: parseFloat(pendingPayout.toFixed(2)),
      totalSubscribers,
      totalPaidArticles: (articles as any[]).length,
      platformFee: platformFee * 100, // 15%
      monthlyEarnings: monthlyEarnings.map(m => m.revenue),
      monthlyLabels: monthlyEarnings.map(m => m.month),
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(earningsData)

  } catch (error) {
    console.error('Earnings API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
