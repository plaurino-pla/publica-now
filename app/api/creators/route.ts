import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const VERSION = '5.0.0-REAL-CREATORS'
  const BUILD_TIME = new Date().toISOString()
  
  try {
    // Use raw SQL to query only fields that exist in production database
    const creators = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        slug, 
        "storeDomain", 
        "createdAt",
        branding
      FROM creators 
      ORDER BY "createdAt" DESC
    `

    // Count articles for each creator using raw SQL
    const creatorsWithCounts = await Promise.all(
      (creators as any[]).map(async (creator) => {
        const articleCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM articles 
          WHERE "creatorId" = ${creator.id} 
          AND status IN ('ready', 'published')
        `
        
        const totalArticles = Number((articleCount as any[])[0]?.count || 0)
        
        return {
          ...creator,
          articles: [],
          _count: { articles: totalArticles },
          contentTypeStats: { text: totalArticles, audio: 0, image: 0, video: 0 },
          isNewCreator: totalArticles === 0,
          totalArticles: totalArticles
        }
      })
    )

    return NextResponse.json({ 
      creators: creatorsWithCounts,
      version: VERSION,
      buildTime: BUILD_TIME,
      debug: {
        totalCreators: creatorsWithCounts.length,
        creatorsWithArticles: creatorsWithCounts.filter(c => c.totalArticles > 0).length,
        creatorsWithoutArticles: creatorsWithCounts.filter(c => c.totalArticles === 0).length,
        totalArticles: creatorsWithCounts.reduce((sum, c) => sum + c.totalArticles, 0),
        note: 'Using real database data with raw SQL queries'
      }
    })
  } catch (error) {
    console.error('Real creators API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch creators', 
        details: error instanceof Error ? error.message : 'Unknown error',
        version: VERSION,
        buildTime: BUILD_TIME,
        note: 'Raw SQL query failed'
      },
      { status: 500 }
    )
  }
}
