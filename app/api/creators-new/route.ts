import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== NEW CREATORS API ROUTE CALLED ===')
    
    // Use raw SQL query to avoid Prisma schema validation issues
    const creators = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        slug, 
        "storeDomain", 
        "createdAt"
      FROM creators 
      ORDER BY "createdAt" DESC
    `

    console.log('Raw SQL query successful. Found creators:', (creators as any[]).length)

    // Count articles for each creator
    const creatorsWithCounts = await Promise.all(
      (creators as any[]).map(async (creator) => {
        const articleCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM articles 
          WHERE "creatorId" = ${creator.id} 
          AND status IN ('ready', 'published')
        `
        
        return {
          ...creator,
          totalArticles: Number((articleCount as any[])[0]?.count || 0),
          isNewCreator: Number((articleCount as any[])[0]?.count || 0) === 0
        }
      })
    )

    return NextResponse.json({ 
      creators: creatorsWithCounts,
      version: '1.0.0-new',
      timestamp: new Date().toISOString(),
      debug: {
        totalCreators: creatorsWithCounts.length,
        creatorsWithArticles: creatorsWithCounts.filter(c => c.totalArticles > 0).length,
        creatorsWithoutArticles: creatorsWithCounts.filter(c => c.totalArticles === 0).length,
        totalArticles: creatorsWithCounts.reduce((sum, c) => sum + c.totalArticles, 0)
      }
    })
  } catch (error) {
    console.error('=== NEW CREATORS API ERROR ===')
    console.error('Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch creators', 
        details: error instanceof Error ? error.message : 'Unknown error',
        version: '1.0.0-new-error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
