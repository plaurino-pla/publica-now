'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/dashboard/page-header'
import { UserPlus, ExternalLink } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'

interface Subscription {
  id: string
  slug: string
  name: string
}

function SubscriptionsContent() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard')
        if (res.ok) {
          const data = await res.json()
          setSubscriptions(data.subscriptions || [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0">
        <PageHeader title="Subscriptions" subtitle="Creators you support" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-white/50">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <PageHeader title="Subscriptions" subtitle="Creators you support" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {subscriptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-2">No subscriptions yet</h3>
            <p className="text-white/50 mb-6">Discover creators and subscribe to access their exclusive content.</p>
            <Button asChild className="bg-brand-600 hover:bg-brand-700">
              <Link href="/creators">Discover Creators</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Link key={sub.id} href={`/${sub.slug}`} className="block">
                <div className="flex items-center justify-between p-4 bg-surface-1 border border-white/[0.06] rounded-lg hover:border-white/[0.12] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/15 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#FAFAFA]">{sub.name}</h3>
                      <p className="text-sm text-white/40">@{sub.slug}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/30" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionsPage() {
  return (
    <AuthGuard>
      <SubscriptionsContent />
    </AuthGuard>
  )
}
