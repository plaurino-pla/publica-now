import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all creators using raw SQL
    const allCreators = await prisma.$queryRaw`
      SELECT 
        id, name, slug, "storeDomain", "createdAt"
      FROM creators
      ORDER BY "createdAt" DESC
    `

    // Get all articles with their status using raw SQL
    const allArticles = await prisma.$queryRaw`
      SELECT 
        id, title, status, "contentType", "creatorId", "createdAt"
      FROM articles
      ORDER BY "createdAt" DESC
    `

    // Count articles per creator
    const creatorCounts = await prisma.$queryRaw`
      SELECT 
        "creatorId", COUNT(*) as count
      FROM articles
      GROUP BY "creatorId"
    `

    // Map creator counts
    const creatorCountMap = (creatorCounts as any[]).reduce((acc: any, curr: any) => {
      acc[curr.creatorId] = curr.count
      return acc
    }, {})

    // Add article counts to creators
    const creatorsWithCounts = (allCreators as any[]).map((creator: any) => ({
      ...creator,
      articles: [],
      _count: { articles: creatorCountMap[creator.id] || 0 }
    }))

    return NextResponse.json({
      debug: {
        totalCreators: creatorsWithCounts.length,
        totalArticles: (allArticles as any[]).length,
        creators: creatorsWithCounts,
        articles: allArticles
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
