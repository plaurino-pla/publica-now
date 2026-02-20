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

    // Check if user is an admin or creator owner
    const memberships = await prisma.$queryRaw`
      SELECT role FROM memberships 
      WHERE "userId" = ${session.user.id} 
      AND role = 'owner'
      LIMIT 1
    `

    if ((memberships as any[]).length === 0) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const results = []

    // Create likes table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS likes (
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
      results.push('❌ Failed to create likes table')
    }

    // Create reading_list table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "readingListItems" (
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
      results.push('❌ Failed to create reading list table')
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
      results.push('❌ Failed to create subscriptions table')
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
          status TEXT DEFAULT 'pending',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, article_id)
        )
      `
      results.push('✅ Purchases table created/verified')
    } catch (error) {
      console.error('Error creating purchases table:', error)
      results.push('❌ Failed to create purchases table')
    }

    // Add foreign key constraints if they don't exist
    try {
      // Add foreign key for likes table
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'likes_user_id_fkey'
          ) THEN
            ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `
      
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'likes_article_id_fkey'
          ) THEN
            ALTER TABLE likes ADD CONSTRAINT likes_article_id_fkey 
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `

      // Add foreign key for reading list table
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'readingListItems_user_id_fkey'
          ) THEN
            ALTER TABLE "readingListItems" ADD CONSTRAINT "readingListItems_user_id_fkey" 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `
      
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'readingListItems_article_id_fkey'
          ) THEN
            ALTER TABLE "readingListItems" ADD CONSTRAINT "readingListItems_article_id_fkey" 
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `

      results.push('✅ Foreign key constraints added/verified')
    } catch (error) {
      console.error('Error adding foreign key constraints:', error)
      results.push('⚠️ Foreign key constraints may already exist')
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables setup completed',
      results
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup database tables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
