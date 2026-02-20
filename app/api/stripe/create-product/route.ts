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

    // Get user's creator membership using raw SQL
    const memberships = await prisma.$queryRaw`
      SELECT "creatorId" FROM memberships 
      WHERE "userId" = ${session.user.id} 
      AND role = 'owner'
      LIMIT 1
    `

    const membership = (memberships as any[])[0]
    if (!membership) {
      return NextResponse.json({ error: 'No creator space' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const price = searchParams.get('price')

    if (!price) {
      return NextResponse.json({ error: 'Price is required' }, { status: 400 })
    }

    // Create Stripe product
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    const product = await stripe.products.create({
      name: 'Monthly Subscription',
      description: 'Access to all creator content',
    })

    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(parseFloat(price) * 100),
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    })

    // Note: We're not updating the creator with subscriptionPrice and subscriptionPriceId
    // as these fields don't exist in the production database schema
    // The Stripe product and price IDs are stored in the response for frontend use

    return NextResponse.json({
      success: true,
      productId: product.id,
      priceId: priceObj.id,
      message: 'Stripe product created successfully. Note: subscriptionPrice fields are not available in current schema.'
    })

  } catch (error) {
    console.error('Error creating Stripe product:', error)
    return NextResponse.json(
      { error: 'Failed to create Stripe product' },
      { status: 500 }
    )
  }
}
