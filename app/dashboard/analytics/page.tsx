'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/dashboard/page-header'
import { BarChart, TrendingUp, Users, FileText, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalArticles: number
  publishedArticles: number
  paidArticles: number
  totalSubscribers: number
  totalRevenue: number
  monthlyData: Array<{
    month: string
    articles: number
    revenue: number
  }>
  lastUpdated: string
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/dashboard/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-0 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-4 text-white/50">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-surface-0 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-2">No analytics data yet</h3>
            <p className="text-white/50 mb-4">
              {error || 'Start creating content to see your analytics here. Your performance data will appear once you publish articles and gain readers.'}
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
              >
                Try Again
              </button>
              <Link href="/dashboard/new" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Create Your First Post
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <PageHeader title="Analytics" subtitle="Track your content performance and audience engagement" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalArticles}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.publishedArticles} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">
                Community members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.paidArticles}</div>
              <p className="text-xs text-muted-foreground">
                Premium content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {analytics.paidArticles} paid articles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Articles</CardTitle>
              <CardDescription>Articles published over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.monthlyData.map((month, index) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-brand-500/100 rounded-t"
                      style={{ 
                        height: `${Math.max(month.articles * 20, 20)}px`,
                        minHeight: '20px'
                      }}
                    />
                    <span className="text-xs text-white/50 mt-2">{month.month}</span>
                    <span className="text-xs font-medium">{month.articles}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue generated over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.monthlyData.map((month, index) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-emerald-500/100 rounded-t"
                      style={{ 
                        height: `${Math.max(month.revenue * 4, 20)}px`,
                        minHeight: '20px'
                      }}
                    />
                    <span className="text-xs text-white/50 mt-2">{month.month}</span>
                    <span className="text-xs font-medium">${month.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-white/40">
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
