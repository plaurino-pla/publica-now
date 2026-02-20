import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.metadata?.type === 'article_purchase') {
          // Handle article purchase completion
          await handleArticlePurchase(session)
        } else if (session.metadata?.type === 'subscription') {
          // Handle subscription creation
          await handleSubscriptionCreated(session)
        }
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as any
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          // Handle successful subscription renewal
          await handleSubscriptionRenewal(invoice.subscription)
        }
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as any
        if (failedInvoice.subscription && typeof failedInvoice.subscription === 'string') {
          // Handle failed subscription payment
          await handleSubscriptionPaymentFailed(failedInvoice.subscription)
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        // Handle subscription cancellation
        await handleSubscriptionCancelled(deletedSubscription.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleArticlePurchase(session: Stripe.Checkout.Session) {
  const { articleId, userId } = session.metadata || {}
  
  if (!articleId || !userId) return

  try {
    // Update purchase status
    await prisma.purchase.updateMany({
      where: {
        userId: userId,
        articleId: articleId
      },
      data: {
        status: 'completed',
        stripePaymentIntentId: session.payment_intent as string
      }
    })
  } catch (error) {
    console.error('Error updating article purchase:', error)
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const { creatorId, userId } = session.metadata || {}
  
  if (!creatorId || !userId) return

  try {
    // Update subscription status
    await prisma.subscription.updateMany({
      where: {
        userId: userId,
        creatorId: creatorId
      },
      data: {
        status: 'active',
        stripeSubscriptionId: session.subscription as string,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionRenewal(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscriptionId
      },
      data: {
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
      }
    })
  } catch (error) {
    console.error('Error handling subscription renewal:', error)
  }
}

async function handleSubscriptionPaymentFailed(subscriptionId: string) {
  try {
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscriptionId
      },
      data: {
        status: 'past_due'
      }
    })
  } catch (error) {
    console.error('Error handling subscription payment failure:', error)
  }
}

async function handleSubscriptionCancelled(subscriptionId: string) {
  try {
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscriptionId
      },
      data: {
        status: 'cancelled'
      }
    })
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}
