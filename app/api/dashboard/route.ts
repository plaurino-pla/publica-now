import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Dashboard API: Starting request')
    
    const session = await getServerSession(authOptions)
    console.log('Dashboard API: Session check result:', !!session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('Dashboard API: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('Dashboard API: User ID:', userId)

    // Fetch real dashboard data
    console.log('Dashboard API: Fetching real dashboard data')
    
    // Get user's creator spaces
    const creatorMemberships = await prisma.$queryRaw`
      SELECT c.id, c.slug, c.name, c."storeDomain"
      FROM creators c
      JOIN memberships m ON c.id = m."creatorId"
      WHERE m."userId" = ${userId} AND m.role = 'owner'
    `

    // Get user's subscriptions
    const userSubscriptions = await prisma.$queryRaw`
      SELECT c.id, c.slug, c.name
      FROM creators c
      JOIN memberships m ON c.id = m."creatorId"
      WHERE m."userId" = ${userId} AND m.role = 'subscriber'
    `

    // Get liked articles with creator info
    const likedArticlesData = await prisma.$queryRaw`
      SELECT a.id, a.title, a.slug, c.slug as creatorSlug, c.name as creatorName
      FROM likes l
      JOIN articles a ON l.article_id = a.id
      JOIN creators c ON a."creatorId" = c.id
      WHERE l.user_id = ${userId}
      ORDER BY l."createdAt" DESC
      LIMIT 10
    `

    // Get reading list with creator info
    const readingListData = await prisma.$queryRaw`
      SELECT a.id, a.title, a.slug, c.slug as creatorSlug, c.name as creatorName
      FROM "readingListItems" rl
      JOIN articles a ON rl.article_id = a.id
      JOIN creators c ON a."creatorId" = c.id
      WHERE rl.user_id = ${userId}
      ORDER BY rl."addedAt" DESC
      LIMIT 10
    `

    // Get stats counts
    const likesCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM likes WHERE user_id = ${userId}
    `
    
    const readingListCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "readingListItems" WHERE user_id = ${userId}
    `
    
    const subscriptionsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM memberships 
      WHERE "userId" = ${userId} AND role = 'subscriber'
    `

    // Get total posts for creator accounts
    let totalPosts = 0
    if ((creatorMemberships as any[]).length > 0) {
      const creatorIds = (creatorMemberships as any[]).map(c => c.id)
      const postsCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM articles 
        WHERE "creatorId" = ANY(${creatorIds})
      `
      totalPosts = (postsCount as any[])[0]?.count || 0
    }

    const dashboardData = {
      user: {
        id: userId,
        email: session.user.email || '',
        name: session.user.name || 'User',
        bio: null,
        avatar: null,
        isCreator: (creatorMemberships as any[]).length > 0,
        isReader: true
      },
      creatorSpaces: (creatorMemberships as any[]).map(c => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        storeDomain: c.storeDomain || `${c.slug}.publica.now`
      })),
      subscriptions: (userSubscriptions as any[]).map(s => ({
        id: s.id,
        slug: s.slug,
        name: s.name
      })),
      likedArticles: (likedArticlesData as any[]).map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        creator: {
          slug: a.creatorSlug,
          name: a.creatorName
        }
      })),
      readingList: (readingListData as any[]).map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        creator: {
          slug: a.creatorSlug,
          name: a.creatorName
        }
      })),
      stats: {
        totalPosts: Number(totalPosts),
        totalLikes: Number((likesCount as any[])[0]?.count || 0),
        totalSubscriptions: Number((subscriptionsCount as any[])[0]?.count || 0),
        totalReadingList: Number((readingListCount as any[])[0]?.count || 0)
      }
    }

    console.log('Dashboard API: Success - returning data')
    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API: Unexpected error:', error)
    console.error('Dashboard API: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
