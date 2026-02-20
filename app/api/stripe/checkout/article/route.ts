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

    const { articleId } = await req.json()

    // Get article using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a.slug, a.pricing, a."creatorId",
        c.slug as "creatorSlug"
      FROM articles a
      JOIN creators c ON a."creatorId" = c.id
      WHERE a.id = ${articleId}
      LIMIT 1
    `

    if ((articles as any[]).length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const article = (articles as any[])[0]

    // Check if user already purchased this article using raw SQL
    const existingPurchases = await prisma.$queryRaw`
      SELECT id FROM purchases 
      WHERE "userId" = ${session.user.id} 
      AND "articleId" = ${articleId}
      LIMIT 1
    `

    const existingPurchase = (existingPurchases as any[])[0]

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
    }

    // Check if user has active subscription using raw SQL
    const subscriptions = await prisma.$queryRaw`
      SELECT id FROM subscriptions 
      WHERE "userId" = ${session.user.id} 
      AND "creatorId" = ${article.creatorId}
      AND status = 'active'
      LIMIT 1
    `

    const subscription = (subscriptions as any[])[0]

    if (subscription) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: article.title,
            },
            unit_amount: Math.round((article.pricing?.USD || 9.99) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout/article/success?articleId=${article.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${article.creatorSlug}/content/${article.slug}`,
      metadata: {
        articleId: article.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
