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

    const results: any = {}

    // Check if likes table exists and get its structure
    try {
      const likesTableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'likes'
        ORDER BY ordinal_position
      `
      results.likes = {
        exists: (likesTableInfo as any[]).length > 0,
        columns: likesTableInfo
      }
    } catch (error) {
      results.likes = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Check if readingListItems table exists and get its structure
    try {
      const readingListTableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'readingListItems'
        ORDER BY ordinal_position
      `
      results.readingListItems = {
        exists: (readingListTableInfo as any[]).length > 0,
        columns: readingListTableInfo
      }
    } catch (error) {
      results.readingListItems = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Check if subscriptions table exists and get its structure
    try {
      const subscriptionsTableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions'
        ORDER BY ordinal_position
      `
      results.subscriptions = {
        exists: (subscriptionsTableInfo as any[]).length > 0,
        columns: subscriptionsTableInfo
      }
    } catch (error) {
      results.subscriptions = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Check if purchases table exists and get its structure
    try {
      const purchasesTableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'purchases'
        ORDER BY ordinal_position
      `
      results.purchases = {
        exists: (purchasesTableInfo as any[]).length > 0,
        columns: purchasesTableInfo
      }
    } catch (error) {
      results.purchases = { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // List all tables in the database
    try {
      const allTables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `
      results.allTables = allTables
    } catch (error) {
      results.allTables = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    return NextResponse.json({
      success: true,
      message: 'Database table structure retrieved',
      results
    })

  } catch (error) {
    console.error('Debug tables error:', error)
    return NextResponse.json(
      { error: 'Failed to debug database tables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
