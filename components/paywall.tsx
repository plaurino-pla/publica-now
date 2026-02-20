'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Crown, CreditCard, Check, ArrowRight } from 'lucide-react'
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
      <div className="border border-white/10 p-8 sm:p-12 text-center bg-[#080808]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-white/10">
          <Crown className="h-6 w-6 text-[#FAFAFA]" />
        </div>
        <h3 className="text-3xl font-heading text-[#FAFAFA] tracking-tight mb-2">Access Granted</h3>
        <p className="text-white/50 text-lg">
          You hold active clearance for {creatorName}'s archive.
        </p>
      </div>
    )
  }

  if (hasPurchased && articleId) {
    return (
      <div className="border border-white/10 p-8 sm:p-12 text-center bg-[#080808]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-brand-500/30">
          <Check className="h-6 w-6 text-brand-400" />
        </div>
        <h3 className="text-3xl font-heading text-[#FAFAFA] tracking-tight mb-2">Record Acquired</h3>
        <p className="text-white/50 text-lg">
          You currently hold permanent clearance to this specific file.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12 my-16">
      <div className="text-center py-12 border-b border-t border-white/[0.05] relative overflow-hidden bg-white/[0.01]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-white/10 relative z-10 bg-[#080808]">
          <Lock className="h-5 w-5 text-white/60" />
        </div>
        <h3 className="text-4xl sm:text-5xl font-heading text-[#FAFAFA] tracking-tight mb-4 relative z-10">
          Encrypted Payload
        </h3>
        <p className="text-white/50 text-xl max-w-lg mx-auto relative z-10">
          Clearance is required to access the remainder of this transmission.
        </p>
      </div>

      <div className="grid gap-px bg-white/[0.05] border border-white/[0.05] md:grid-cols-2">
        {/* Individual Article Purchase */}
        {articleId && (
          <div className="bg-[#080808] p-8 sm:p-12 flex flex-col justify-between group hover:bg-white/[0.01] transition-colors">
            <div>
              <div className="flex justify-between items-start mb-12">
                <CreditCard className="h-6 w-6 text-white/40 group-hover:text-[#FAFAFA] transition-colors" />
                <span className="font-mono text-xs uppercase tracking-widest text-white/40 border border-white/10 px-2 py-1">One-Time</span>
              </div>
              <h4 className="text-2xl font-heading text-[#FAFAFA] mb-2">Decrypt Single File</h4>
              <p className="text-white/50 mb-12">Gain permanent access solely to this particular transmission.</p>
            </div>

            <div>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-heading text-[#FAFAFA]">{formatPrice(articlePrice)}</span>
              </div>
              <Button
                onClick={() => handlePurchase('article')}
                disabled={isLoading}
                className="w-full h-14 rounded-none bg-white/5 border border-white/10 text-[#FAFAFA] hover:bg-white/10 font-mono text-xs uppercase tracking-widest transition-colors flex justify-between items-center px-6"
                aria-label={`Buy article for ${formatPrice(articlePrice)}`}
              >
                {loadingType === 'article' ? 'Processing...' : 'Acquire File'}
                <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </div>
          </div>
        )}

        {/* Subscription */}
        {subscriptionPriceId && (
          <div className="bg-[#080808] p-8 sm:p-12 flex flex-col justify-between group hover:bg-white/[0.01] transition-colors">
            <div>
              <div className="flex justify-between items-start mb-12">
                <Crown className="h-6 w-6 text-brand-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="font-mono text-xs uppercase tracking-widest text-brand-400 border border-brand-500/20 px-2 py-1">Recurring</span>
              </div>
              <h4 className="text-2xl font-heading text-[#FAFAFA] mb-2">Total Archive Access</h4>
              <p className="text-white/50 mb-12">Attain unrestricted clearance to all current and future transmissions by {creatorName}.</p>
            </div>

            <div>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-heading text-brand-400">{formatPrice(subscriptionPrice)}</span>
                <span className="font-mono font-normal text-xs text-white/40 uppercase">/ month</span>
              </div>
              <Button
                onClick={() => handlePurchase('subscription')}
                disabled={isLoading}
                className="w-full h-14 rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 font-mono text-xs uppercase tracking-widest transition-colors flex justify-between items-center px-6"
                aria-label={`Subscribe for ${formatPrice(subscriptionPrice)} per month`}
              >
                {loadingType === 'subscription' ? 'Processing...' : 'Establish Uplink'}
                <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm font-mono p-4 border border-red-500/20 bg-red-500/5 max-w-2xl mx-auto">
          [OVERRIDE FAILED]: {error}
        </div>
      )}

      <div className="text-center font-mono text-xs text-white/30 uppercase tracking-widest pt-8">
        Secure Handshake via Stripe
      </div>
    </div>
  )
}
