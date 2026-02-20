'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Users, FileText, Zap } from 'lucide-react'

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
          className="text-white"
          style={{ backgroundColor: mainColor }}
          onClick={() => setShowModal(true)}
        >
          Subscribe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Subscribe to {creatorName}</DialogTitle>
          <DialogDescription className="text-center">
            Get unlimited access to all content and support the creator
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Pricing Card */}
          <Card className="border-2 border-brand-200 bg-brand-50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-brand-900">
                {formatPrice(subscriptionPrice)}/month
              </CardTitle>
              <CardDescription className="text-brand-700">
                Cancel anytime • No hidden fees
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">What's included:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Access to all subscriber-only content</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Early access to new releases</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Support the creator directly</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Cancel or change plan anytime</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex-1"
              style={{ backgroundColor: mainColor }}
            >
              {isLoading ? 'Processing...' : `Subscribe for ${formatPrice(subscriptionPrice)}/month`}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          <p className="text-xs text-gray-500 text-center">
            You'll be redirected to Stripe to complete your subscription securely
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
