import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data using raw SQL
    const users = await prisma.$queryRaw`
      SELECT id, email, "updatedAt"
      FROM users 
      WHERE id = ${session.user.id}
      LIMIT 1
    `

    const user = (users as any[])[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Initialize empty arrays for missing tables
    let memberships: any[] = []
    let subscriptions: any[] = []
    let likes: any[] = []
    let readingList: any[] = []

    try {
      // Get user's creator memberships using raw SQL
      memberships = await prisma.$queryRaw`
        SELECT 
          m.id,
          m.role,
          c.id as "creatorId",
          c.slug as "creatorSlug",
          c.name as "creatorName",
          c."storeDomain"
        FROM memberships m
        JOIN creators c ON m."creatorId" = c.id
        WHERE m."userId" = ${session.user.id}
      `
    } catch (error) {
      // Create memberships table if it doesn't exist
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS memberships (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "creatorId" TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
          role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE("userId", "creatorId")
        )
      `)
      
      // Auto-create creator account for user if they don't have one
      const existingMemberships = await prisma.$queryRaw`
        SELECT "creatorId" FROM memberships 
        WHERE "userId" = ${session.user.id} 
        AND role = 'owner'
        LIMIT 1
      `
      
      if ((existingMemberships as any[]).length === 0) {
        // Create a creator account for the user
        const creatorResult = await prisma.$queryRaw`
          INSERT INTO creators (
            id, slug, name, "storeDomain", "encryptedPublicaApiToken", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid()::text,
            ${'creator-' + Math.random().toString(36).slice(2, 6)},
            ${'My Creator Space'},
            ${'creator-' + Math.random().toString(36).slice(2, 6) + '.publica.now'},
            ${'demo-token-' + Math.random().toString(36).slice(2, 6)},
            NOW(),
            NOW()
          )
          RETURNING id
        `
        
        const creator = (creatorResult as any[])[0]
        
        // Create membership linking user to creator with owner role
        await prisma.$queryRaw`
          INSERT INTO memberships (
            id, "userId", "creatorId", role, "createdAt"
          )
          VALUES (
            gen_random_uuid()::text,
            ${session.user.id},
            ${creator.id},
            'owner',
            NOW()
          )
        `
        
        // Now get the updated memberships
        memberships = await prisma.$queryRaw`
          SELECT 
            m.id,
            m.role,
            c.id as "creatorId",
            c.slug as "creatorSlug",
            c.name as "creatorName",
            c."storeDomain"
          FROM memberships m
          JOIN creators c ON m."creatorId" = c.id
          WHERE m."userId" = ${session.user.id}
        `
        
      }
    }

    try {
      // Get user's subscriptions using raw SQL
      subscriptions = await prisma.$queryRaw`
        SELECT 
          s.id,
          s.status,
          c.id as "creatorId",
          c.slug as "creatorSlug",
          c.name as "creatorName"
        FROM subscriptions s
        JOIN creators c ON s."creatorId" = c.id
        WHERE s."userId" = ${session.user.id}
      `
    } catch (error) {
      subscriptions = []
    }

    try {
      // Get user's liked articles using raw SQL
      likes = await prisma.$queryRaw`
        SELECT 
          l.id,
          a.id as "articleId",
          a.title as "articleTitle",
          a.slug as "articleSlug",
          c.slug as "creatorSlug",
          c.name as "creatorName"
        FROM likes l
        JOIN articles a ON l.article_id = a.id
        JOIN creators c ON a."creatorId" = c.id
        WHERE l.user_id = ${session.user.id}
      `
    } catch (error) {
      likes = []
    }

    try {
      // Get user's reading list using raw SQL
      readingList = await prisma.$queryRaw`
        SELECT 
          r.id,
          a.id as "articleId",
          a.title as "articleTitle",
          a.slug as "articleSlug",
          c.slug as "creatorSlug",
          c.name as "creatorName"
        FROM "readingListItems" r
        JOIN articles a ON r.article_id = a.id
        JOIN creators c ON a."creatorId" = c.id
        WHERE r.user_id = ${session.user.id}
      `
    } catch (error) {
      readingList = []
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: 'My Creator Space', // Default name since users table doesn't have name column
      bio: null, // Default since users table doesn't have bio column
      avatar: null, // Default since users table doesn't have avatar column
      updatedAt: user.updatedAt,
      creatorSpaces: (memberships as any[]).filter(m => m.role === 'owner').map(m => ({
        id: m.creatorId,
        slug: m.creatorSlug,
        name: m.creatorName,
        storeDomain: m.storeDomain,
      })),
      subscriptions: (subscriptions as any[]).filter(s => s.status === 'active').map(s => ({
        id: s.creatorId,
        slug: s.creatorSlug,
        name: s.creatorName,
      })),
      likedArticles: (likes as any[]).map(l => ({
        id: l.articleId,
        title: l.articleTitle,
        slug: l.articleSlug,
        creator: {
          slug: l.creatorSlug,
          name: l.creatorName,
        }
      })),
      readingList: (readingList as any[]).map(r => ({
        id: r.articleId,
        title: r.articleTitle,
        slug: r.articleSlug,
        creator: {
          slug: r.creatorSlug,
          name: r.creatorName,
        }
      })),
      isCreator: (memberships as any[]).some(m => m.role === 'owner'),
      isReader: (subscriptions as any[]).length > 0 || (likes as any[]).length > 0 || (readingList as any[]).length > 0,
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    // Update the user using raw SQL
    const updatedUsers = await prisma.$queryRaw`
      UPDATE users 
      SET name = ${data.name}, bio = ${data.bio || null}, avatar = ${data.avatar || null}, "updatedAt" = NOW()
      WHERE id = ${session.user.id}
      RETURNING id, email, name, bio, avatar, "updatedAt"
    `

    const updatedUser = (updatedUsers as any[])[0]

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        updatedAt: updatedUser.updatedAt,
      }
    })

  } catch (error) {
    console.error('Update user profile error:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
