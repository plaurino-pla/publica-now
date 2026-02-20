import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { stripe } = await import('@/lib/stripe')
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { creatorId } = await req.json()

    // Get creator details using raw SQL
    const creators = await prisma.$queryRaw`
      SELECT id, slug, name FROM creators WHERE id = ${creatorId}
    `

    const creator = (creators as any[])[0]

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Check if user is already subscribed using raw SQL
    const existingSubscriptions = await prisma.$queryRaw`
      SELECT id, status FROM subscriptions 
      WHERE "userId" = ${session.user.id} 
      AND "creatorId" = ${creatorId}
      LIMIT 1
    `

    const existingSubscription = (existingSubscriptions as any[])[0]

    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json({ error: 'Already subscribed to this creator' }, { status: 400 })
    }

    // Create Stripe checkout session for subscription with dynamic pricing
    const session_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout/subscription/success?creatorId=${creatorId}`

    // Use dynamic pricing - create a one-time price for this subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Subscription to ${creator.name}`,
              description: `Monthly subscription to ${creator.name}'s content`,
            },
            unit_amount: 999, // $9.99 per month
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: session_url,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${creator.slug}`,
      metadata: {
        userId: session.user.id,
        creatorId: creatorId,
        type: 'subscription'
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Error creating subscription checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
