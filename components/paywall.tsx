'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Crown, CreditCard, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface PaywallProps {
  articleId?: string
  creatorId: string
  creatorName: string
  creatorSlug: string
  articleTitle?: string
  articlePrice?: number
  subscriptionPrice?: number
  subscriptionPriceId?: string
  isSubscribed?: boolean
  hasPurchased?: boolean
}

export default function Paywall({
  articleId,
  creatorId,
  creatorName,
  creatorSlug,
  articleTitle,
  articlePrice = 500,
  subscriptionPrice = 1000,
  subscriptionPriceId,
  isSubscribed = false,
  hasPurchased = false
}: PaywallProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<'article' | 'subscription' | null>(null)
  const [error, setError] = useState('')

  const handlePurchase = async (type: 'article' | 'subscription') => {
    if (!session?.user) {
      // Redirect to sign in
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    setLoadingType(type)

    try {
      const endpoint = type === 'article' 
        ? '/api/stripe/checkout/article'
        : '/api/stripe/checkout/subscription'

      const payload = type === 'article' 
        ? { articleId }
        : { creatorId }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Checkout failed. Please try again.')
      }
    } catch {
      setError('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
      setLoadingType(null)
    }
  }

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`
  }

  if (isSubscribed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Crown className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Subscriber Access</CardTitle>
          <CardDescription className="text-green-600">
            You have full access to all content from {creatorName}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (hasPurchased && articleId) {
    return (
      <Card className="border-brand-200 bg-brand-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
            <Check className="h-6 w-6 text-brand-600" />
          </div>
          <CardTitle className="text-brand-800">Article Purchased</CardTitle>
          <CardDescription className="text-brand-600">
            You have access to this article
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-amber-800">Premium Content</CardTitle>
          <CardDescription className="text-amber-600">
            This content requires payment to access
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Individual Article Purchase */}
        {articleId && (
          <Card className="border-2 border-gray-200 hover:border-brand-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Individual Article
              </CardTitle>
              <CardDescription>
                Purchase this specific article
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600">
                  {formatPrice(articlePrice)}
                </div>
                <div className="mt-1"><Badge variant="outline">One-time purchase</Badge></div>
              </div>
              <Button
                onClick={() => handlePurchase('article')}
                disabled={isLoading}
                className="w-full"
                size="lg"
                aria-label={`Buy article for ${formatPrice(articlePrice)}`}
              >
                {loadingType === 'article' ? 'Loading...' : `Buy Article - ${formatPrice(articlePrice)}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subscription */}
        {subscriptionPriceId && (
          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Monthly Subscription
              </CardTitle>
              <CardDescription>
                Access all content from {creatorName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {formatPrice(subscriptionPrice)}
                </div>
                <div className="mt-1"><Badge variant="outline">Per month</Badge></div>
              </div>
              <Button
                onClick={() => handlePurchase('subscription')}
                disabled={isLoading}
                className="w-full"
                size="lg"
                variant="default"
                aria-label={`Subscribe for ${formatPrice(subscriptionPrice)} per month`}
              >
                {loadingType === 'subscription' ? 'Loading...' : `Subscribe - ${formatPrice(subscriptionPrice)}/month`}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md text-center">
          {error}
        </div>
      )}
      <div className="text-center text-sm text-gray-500">
        Secure payment powered by Stripe
      </div>
    </div>
  )
}
