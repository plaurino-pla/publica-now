'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Check, ArrowRight } from 'lucide-react'

interface SubscriptionButtonProps {
  creatorId: string
  mainColor: string
  creatorName?: string
  subscriptionPrice?: number
}

export default function SubscriptionButton({ creatorId, mainColor, creatorName = 'Creator', subscriptionPrice = 999 }: SubscriptionButtonProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      })

      if (response.ok) {
        const { url } = await response.json()
        if (url) window.location.href = url
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to start checkout')
      }
    } catch {
      setError('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="rounded-none font-mono text-xs uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: mainColor }}
          onClick={() => setShowModal(true)}
        >
          Establish Uplink
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#080808] border border-white/10 rounded-none p-0 overflow-hidden">
        <div className="p-8 sm:p-10">
          <DialogHeader className="mb-8">
            <span className="font-mono text-xs text-brand-400 uppercase tracking-widest block mb-4">Total Access Subscription</span>
            <DialogTitle className="text-3xl font-heading text-[#FAFAFA] tracking-tight">Connect to {creatorName}</DialogTitle>
            <DialogDescription className="text-white/50 text-sm mt-2">
              Bypass firewalls. Gain uninterrupted clearance to all restricted files.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Pricing Node */}
            <div className="border border-brand-500/20 bg-brand-500/5 p-6 text-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-heading text-brand-400">
                  {formatPrice(subscriptionPrice)}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-white/40">/ mo</span>
              </div>
              <p className="text-brand-400/60 font-mono text-xs uppercase tracking-widest">
                Cancel Anytime • Zero Covert Fees
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 font-mono text-xs uppercase tracking-widest">
              <div className="flex items-start gap-4">
                <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span className="text-white/60">Decrypted access to all subscriber files</span>
              </div>
              <div className="flex items-start gap-4">
                <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span className="text-white/60">Priority clearance for zero-day drops</span>
              </div>
              <div className="flex items-start gap-4">
                <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span className="text-white/60">Direct hardware support to {creatorName}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col gap-3">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full h-14 rounded-none font-mono text-xs uppercase tracking-widest flex justify-between items-center px-6 transition-opacity hover:opacity-90"
                style={{ backgroundColor: mainColor, color: '#FAFAFA' }}
              >
                {isLoading ? 'Processing...' : `Initiate Protocol • ${formatPrice(subscriptionPrice)}/mo`}
                <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="w-full h-14 rounded-none border-white/10 text-white/50 hover:text-[#FAFAFA] hover:bg-white/[0.03] font-mono text-xs uppercase tracking-widest"
              >
                Abort
              </Button>
            </div>

            {error && (
              <p className="font-mono text-xs uppercase tracking-widest text-red-400 bg-red-500/5 border border-red-500/20 p-4 text-center">
                [ERROR]: {error}
              </p>
            )}

            <p className="text-[10px] font-mono tracking-widest uppercase text-white/30 text-center">
              Secure Auth token exchange via Stripe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
