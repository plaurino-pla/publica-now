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

    // Test basic database connection
    const testResults: any = {}

    // Test 1: Check if likes table exists
    try {
      const likesTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'likes'
        ) as exists
      `
      testResults.likesTableExists = (likesTableExists as any[])[0]?.exists || false
    } catch (error) {
      testResults.likesTableExists = false
      testResults.likesTableError = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test 2: Check if readingListItems table exists
    try {
      const readingListTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'readingListItems'
        ) as exists
      `
      testResults.readingListTableExists = (readingListTableExists as any[])[0]?.exists || false
    } catch (error) {
      testResults.readingListTableExists = false
      testResults.readingListTableError = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test 3: Try to insert a test like (will be rolled back)
    try {
      await prisma.$executeRaw`BEGIN`
      
      // Get a sample article ID
      const sampleArticle = await prisma.$queryRaw`
        SELECT id FROM articles LIMIT 1
      `
      
      if ((sampleArticle as any[]).length > 0) {
        const articleId = (sampleArticle as any[])[0].id
        
        // Try to insert a test like
        await prisma.$executeRaw`
          INSERT INTO likes (user_id, article_id, "createdAt")
          VALUES (${session.user.id}, ${articleId}, NOW())
        `
        
        // Rollback the test insert
        await prisma.$executeRaw`ROLLBACK`
        
        testResults.likeInsertTest = 'PASSED'
      } else {
        testResults.likeInsertTest = 'SKIPPED - No articles found'
      }
    } catch (error) {
      testResults.likeInsertTest = 'FAILED'
      testResults.likeInsertError = error instanceof Error ? error.message : 'Unknown error'
      // Make sure to rollback on error
      try {
        await prisma.$executeRaw`ROLLBACK`
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
    }

    // Test 4: Check table structure
    try {
      const likesColumns = await prisma.$queryRaw`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = 'likes'
        ORDER BY ordinal_position
      `
      testResults.likesTableStructure = likesColumns
    } catch (error) {
      testResults.likesTableStructure = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    return NextResponse.json({
      success: true,
      message: 'Like functionality test completed',
      userId: session.user.id,
      results: testResults
    })

  } catch (error) {
    console.error('Test like error:', error)
    return NextResponse.json(
      { error: 'Failed to test like functionality', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
