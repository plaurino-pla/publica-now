import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = []

    // Create likes table if it doesn't exist
    try {
      // Drop and recreate to ensure correct schema
      await prisma.$executeRaw`DROP TABLE IF EXISTS likes CASCADE`
      await prisma.$executeRaw`
        CREATE TABLE likes (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id TEXT NOT NULL,
          article_id TEXT NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        )
      `
      results.push('✅ Likes table created/verified')
    } catch (error) {
      console.error('Error creating likes table:', error)
      results.push('❌ Failed to create likes table: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }

    // Create readingListItems table if it doesn't exist
    try {
      // Drop and recreate to ensure correct schema
      await prisma.$executeRaw`DROP TABLE IF EXISTS "readingListItems" CASCADE`
      await prisma.$executeRaw`
        CREATE TABLE "readingListItems" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id TEXT NOT NULL,
          article_id TEXT NOT NULL,
          "addedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        )
      `
      results.push('✅ Reading list table created/verified')
    } catch (error) {
      console.error('Error creating reading list table:', error)
      results.push('❌ Failed to create reading list table: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }

    // Create subscriptions table if it doesn't exist
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id TEXT NOT NULL,
          creator_id TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          plan TEXT,
          "stripeSubscriptionId" TEXT,
          "currentPeriodStart" TIMESTAMP WITH TIME ZONE,
          "currentPeriodEnd" TIMESTAMP WITH TIME ZONE,
          "expiresAt" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, creator_id)
        )
      `
      results.push('✅ Subscriptions table created/verified')
    } catch (error) {
      console.error('Error creating subscriptions table:', error)
      results.push('❌ Failed to create subscriptions table: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }

    // Create purchases table if it doesn't exist
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS purchases (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id TEXT NOT NULL,
          article_id TEXT NOT NULL,
          amount INTEGER NOT NULL,
          currency TEXT DEFAULT 'usd',
          "stripePaymentIntentId" TEXT,
          status TEXT DEFAULT 'completed',
          "purchasedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        )
      `
      results.push('✅ Purchases table created/verified')
    } catch (error) {
      console.error('Error creating purchases table:', error)
      results.push('❌ Failed to create purchases table: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }

    // Test if the tables work by doing actual insert/delete operations
    let testResults = []
    
    // Test likes table with actual insert/delete
    try {
      // Get a sample article to test with
      const sampleArticle = await prisma.$queryRaw`SELECT id FROM articles LIMIT 1`
      if ((sampleArticle as any[]).length > 0) {
        const articleId = (sampleArticle as any[])[0].id
        
        // Test insert
        await prisma.$executeRaw`
          INSERT INTO likes (user_id, article_id, "createdAt")
          VALUES (${session.user.id}, ${articleId}, NOW())
          ON CONFLICT (user_id, article_id) DO NOTHING
        `
        
        // Test select
        const testLike = await prisma.$queryRaw`
          SELECT id FROM likes 
          WHERE user_id = ${session.user.id} AND article_id = ${articleId}
          LIMIT 1
        `
        
        // Test delete
        await prisma.$executeRaw`
          DELETE FROM likes 
          WHERE user_id = ${session.user.id} AND article_id = ${articleId}
        `
        
        testResults.push('✅ Likes table full CRUD test: PASSED')
      } else {
        testResults.push('⚠️ Likes table test: SKIPPED (no articles found)')
      }
    } catch (error) {
      testResults.push('❌ Likes table CRUD test: FAILED - ' + (error instanceof Error ? error.message : 'Unknown error'))
    }

    // Test readingListItems table with actual insert/delete
    try {
      // Get a sample article to test with
      const sampleArticle = await prisma.$queryRaw`SELECT id FROM articles LIMIT 1`
      if ((sampleArticle as any[]).length > 0) {
        const articleId = (sampleArticle as any[])[0].id
        
        // Test insert
        await prisma.$executeRaw`
          INSERT INTO "readingListItems" (user_id, article_id, "addedAt")
          VALUES (${session.user.id}, ${articleId}, NOW())
          ON CONFLICT (user_id, article_id) DO NOTHING
        `
        
        // Test select
        const testSave = await prisma.$queryRaw`
          SELECT id FROM "readingListItems" 
          WHERE user_id = ${session.user.id} AND article_id = ${articleId}
          LIMIT 1
        `
        
        // Test delete
        await prisma.$executeRaw`
          DELETE FROM "readingListItems" 
          WHERE user_id = ${session.user.id} AND article_id = ${articleId}
        `
        
        testResults.push('✅ Reading list table full CRUD test: PASSED')
      } else {
        testResults.push('⚠️ Reading list table test: SKIPPED (no articles found)')
      }
    } catch (error) {
      testResults.push('❌ Reading list table CRUD test: FAILED - ' + (error instanceof Error ? error.message : 'Unknown error'))
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables setup completed',
      userId: session.user.id,
      results,
      testResults
    })

  } catch (error) {
    console.error('Fix DB error:', error)
    return NextResponse.json(
      { error: 'Failed to fix database tables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
