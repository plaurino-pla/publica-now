import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const creatorSlug = params.slug

    // Check if creator exists using raw SQL
    const creators = await prisma.$queryRaw`
      SELECT id FROM creators WHERE slug = ${creatorSlug}
    `

    const creator = (creators as any[])[0]

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Check if user is trying to subscribe to themselves using raw SQL
    const userMemberships = await prisma.$queryRaw`
      SELECT id FROM memberships 
      WHERE "userId" = ${session.user.id} 
      AND "creatorId" = ${creator.id}
      AND role = 'owner'
      LIMIT 1
    `

    if ((userMemberships as any[]).length > 0) {
      return NextResponse.json({ 
        error: 'You cannot subscribe to your own creator space' 
      }, { status: 400 })
    }

    // Check if user already subscribed using raw SQL
    const existingSubscriptions = await prisma.$queryRaw`
      SELECT id FROM subscriptions 
      WHERE "userId" = ${session.user.id} 
      AND "creatorId" = ${creator.id}
      LIMIT 1
    `

    const existingSubscription = (existingSubscriptions as any[])[0]

    if (existingSubscription) {
      // Cancel subscription using raw SQL
      await prisma.$queryRaw`
        UPDATE subscriptions 
        SET status = 'cancelled', "updatedAt" = NOW()
        WHERE id = ${existingSubscription.id}
      `

      return NextResponse.json({ 
        message: 'Subscription cancelled',
        subscribed: false 
      })
    } else {
      // Create subscription using raw SQL
      await prisma.$queryRaw`
        INSERT INTO subscriptions ("userId", "creatorId", status, plan, "expiresAt", "createdAt", "updatedAt")
        VALUES (${session.user.id}, ${creator.id}, 'active', 'monthly', ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}, NOW(), NOW())
      `

      return NextResponse.json({ 
        message: 'Subscribed successfully',
        subscribed: true 
      })
    }

  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe/unsubscribe' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const creatorSlug = params.slug

    // Check if creator exists using raw SQL
    const creators = await prisma.$queryRaw`
      SELECT id FROM creators WHERE slug = ${creatorSlug}
    `

    const creator = (creators as any[])[0]

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Check if user is subscribed using raw SQL
    const subscriptions = await prisma.$queryRaw`
      SELECT id, status, plan, "expiresAt" FROM subscriptions 
      WHERE "userId" = ${session.user.id} 
      AND "creatorId" = ${creator.id}
      LIMIT 1
    `

    const subscription = (subscriptions as any[])[0]

    // Get total subscribers count using raw SQL
    const subscribersCountResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM subscriptions 
      WHERE "creatorId" = ${creator.id}
      AND status = 'active'
    `

    const subscribersCount = Number((subscribersCountResult as any[])[0]?.count || 0)

    return NextResponse.json({
      subscribed: subscription?.status === 'active',
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        expiresAt: subscription.expiresAt
      } : null,
      subscribersCount
    })

  } catch (error) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
