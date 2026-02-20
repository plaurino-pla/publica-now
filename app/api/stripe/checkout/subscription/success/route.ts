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

    const { searchParams } = new URL(req.url)
    const creatorId = searchParams.get('creatorId')

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 })
    }

    // Get creator details using raw SQL
    const creators = await prisma.$queryRaw`
      SELECT id, slug FROM creators WHERE id = ${creatorId}
    `

    const creator = (creators as any[])[0]

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Check if subscription already exists using raw SQL
    const existingSubscriptions = await prisma.$queryRaw`
      SELECT id FROM subscriptions 
      WHERE "userId" = ${session.user.id} 
      AND "creatorId" = ${creatorId}
      LIMIT 1
    `

    const existingSubscription = (existingSubscriptions as any[])[0]

    if (existingSubscription) {
      // Update existing subscription status using raw SQL
      await prisma.$queryRaw`
        UPDATE subscriptions 
        SET status = 'active', "currentPeriodStart" = NOW(), "currentPeriodEnd" = ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
        WHERE id = ${existingSubscription.id}
      `
    } else {
      // Create new subscription record using raw SQL
      await prisma.$queryRaw`
        INSERT INTO subscriptions (
          "userId", "creatorId", status, "currentPeriodStart", "currentPeriodEnd", plan, "createdAt", "updatedAt"
        )
        VALUES (
          ${session.user.id}, ${creatorId}, 'active', NOW(), 
          ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}, 'monthly', NOW(), NOW()
        )
      `
    }

    // Redirect to the creator page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/${creator.slug}`)

  } catch (error) {
    console.error('Error handling subscription success:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}
