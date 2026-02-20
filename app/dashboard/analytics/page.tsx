'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/dashboard/page-header'
import { BarChart, LineChart, TrendingUp, Users, Eye, Download, FileText, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalArticles: number
  publishedArticles: number
  paidArticles: number
  totalSubscribers: number
  totalViews: number
  totalRevenue: number
  monthlyData: Array<{
    month: string
    articles: number
    views: number
    revenue: number
  }>
  lastUpdated: string
  note: string
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data yet</h3>
            <p className="text-gray-600 mb-4">
              {error || 'Start creating content to see your analytics here. Your performance data will appear once you publish articles and gain readers.'}
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50">
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
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Content engagement
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

        {/* Note about placeholder data */}
        {analytics.note && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xs">ℹ</span>
              </div>
              <p className="text-sm text-yellow-800">{analytics.note}</p>
            </div>
          </div>
        )}

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
                      className="w-full bg-blue-500 rounded-t"
                      style={{ 
                        height: `${Math.max(month.articles * 20, 20)}px`,
                        minHeight: '20px'
                      }}
                    />
                    <span className="text-xs text-gray-600 mt-2">{month.month}</span>
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
                      className="w-full bg-green-500 rounded-t"
                      style={{ 
                        height: `${Math.max(month.revenue * 4, 20)}px`,
                        minHeight: '20px'
                      }}
                    />
                    <span className="text-xs text-gray-600 mt-2">{month.month}</span>
                    <span className="text-xs font-medium">${month.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
