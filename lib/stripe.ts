import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

export const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// Utility functions for creating checkout sessions
export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function createPaymentIntent({
  amount,
  currency = 'usd',
  metadata = {},
}: {
  amount: number
  currency?: string
  metadata?: Record<string, string>
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return { clientSecret: paymentIntent.client_secret }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}
