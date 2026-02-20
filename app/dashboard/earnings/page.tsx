'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/dashboard/page-header'
import { TrendingUp, DollarSign, CreditCard, Wallet, Users, FileText, Percent } from 'lucide-react'
import Link from 'next/link'

interface EarningsData {
  totalEarnings: number
  thisMonth: number
  lastMonth: number
  pendingPayout: number
  totalSubscribers: number
  totalPaidArticles: number
  platformFee: number
  monthlyEarnings: number[]
  monthlyLabels: string[]
  lastUpdated: string
}

export default function EarningsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch('/api/dashboard/earnings')
        if (!response.ok) {
          throw new Error('Failed to fetch earnings data')
        }
        const data = await response.json()
        setEarnings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load earnings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEarnings()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading earnings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !earnings) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings data yet</h3>
            <p className="text-gray-600 mb-4">
              {error || 'Start monetizing your content to see your earnings here. Your revenue data will appear once you publish paid articles or gain subscribers.'}
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
              >
                Try Again
              </button>
              <Link href="/dashboard/new" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Create Paid Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Earnings" subtitle="Track your revenue and manage payouts" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                After {earnings.platformFee}% platform fee
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings.thisMonth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {earnings.lastMonth > 0 ? 
                  `${((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)}% from last month` :
                  'First month earnings'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Month</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings.lastMonth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Previous month earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings.pendingPayout.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnings.totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">
                Monthly recurring revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnings.totalPaidArticles}</div>
              <p className="text-xs text-muted-foreground">
                Premium content pieces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Fee</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnings.platformFee}%</div>
              <p className="text-xs text-muted-foreground">
                Transaction fee
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Earnings Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Revenue generated over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {earnings.monthlyEarnings.map((revenue, index) => (
                <div key={earnings.monthlyLabels[index]} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ 
                      height: `${Math.max(revenue * 2, 20)}px`,
                      minHeight: '20px'
                    }}
                  />
                  <span className="text-xs text-gray-600 mt-2">{earnings.monthlyLabels[index]}</span>
                  <span className="text-xs font-medium">${revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Information</CardTitle>
            <CardDescription>How to receive your earnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-brand-50 rounded-lg">
                <h4 className="font-medium text-brand-900 mb-2">Available Balance</h4>
                <p className="text-2xl font-bold text-brand-900">${earnings.pendingPayout.toFixed(2)}</p>
                <p className="text-sm text-brand-700 mt-1">Ready for withdrawal</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Minimum Payout</h4>
                <p className="text-2xl font-bold text-green-900">$50.00</p>
                <p className="text-sm text-green-700 mt-1">Required to withdraw</p>
              </div>
            </div>
            <div className="text-center">
              <button 
                disabled={earnings.pendingPayout < 50}
                className={`px-6 py-3 rounded-lg font-medium ${
                  earnings.pendingPayout >= 50
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {earnings.pendingPayout >= 50 ? 'Request Payout' : 'Minimum $50 required'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Last updated: {new Date(earnings.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
