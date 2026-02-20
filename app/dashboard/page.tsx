'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Settings, ArrowRight, RefreshCw, Users, DollarSign, TrendingUp, Heart, Bookmark, UserPlus, Search, Plus, BarChart3 } from 'lucide-react'
import { NewPostDropdown } from '@/components/new-post-dropdown'
import AuthGuard from '@/components/auth-guard'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'
import { PageHeader } from '@/components/dashboard/page-header'

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    bio?: string
    avatar?: string
    isCreator: boolean
    isReader: boolean
  }
  creatorSpaces: Array<{
    id: string
    slug: string
    name: string
    storeDomain: string
  }>
  subscriptions: Array<{
    id: string
    slug: string
    name: string
  }>
  likedArticles: Array<{
    id: string
    title: string
    slug: string
    creator: {
      slug: string
      name: string
    }
  }>
  readingList: Array<{
    id: string
    title: string
    slug: string
    creator: {
      slug: string
      name: string
    }
  }>
  stats: {
    totalPosts: number
    totalLikes: number
    totalSubscriptions: number
    totalReadingList: number
  }
}

function DashboardContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          console.error('Dashboard API error:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleSyncPublica = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sync/publica', { method: 'POST' })
      const result = await response.json()
      alert(result.message)
    } catch (error) {
      alert('Failed to sync with publica.la')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestPublica = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test/publica')
      const result = await response.json()
      console.log('Publica.la test result:', result)
      alert(`Test completed!\n\nStatus: ${result.status}\nMessage: ${result.message}\n\nCheck console for details.`)
    } catch (error) {
      alert('Failed to test publica.la connection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshDashboard = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        // Show success message briefly
        const refreshBtn = document.querySelector('[data-refresh-btn]') as HTMLButtonElement
        if (refreshBtn) {
          const originalText = refreshBtn.textContent
          refreshBtn.textContent = 'Refreshed!'
          setTimeout(() => {
            refreshBtn.textContent = originalText
          }, 2000)
        }
      } else {
        console.error('Dashboard refresh error:', response.status, response.statusText)
        alert('Failed to refresh dashboard data')
      }
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error)
      alert('Failed to refresh dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageSection background="muted" className="min-h-[60vh] flex items-center">
        <Container className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </Container>
      </PageSection>
    )
  }

  if (!dashboardData) {
    return (
      <PageSection background="muted" className="min-h-[60vh] flex items-center">
        <Container className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
        </Container>
      </PageSection>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${dashboardData.user.name || 'User'}!`} 
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshDashboard}
              disabled={loading}
              data-refresh-btn
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            {dashboardData.user.isCreator && <NewPostDropdown />}
          </div>
        } 
      />

      {/* Main Content */}
      <PageSection background="default" className="py-8 lg:py-12">
        <Container>
          {/* Stats Grid - Responsive 4-column layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {dashboardData.user.isCreator && (
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Posts</p>
                    <p className="mt-2 text-2xl lg:text-3xl font-bold text-gray-900">{dashboardData.stats.totalPosts}</p>
                    <p className="text-xs text-gray-500 mt-1">Published content</p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Liked Articles Counter */}
            <Link href="/dashboard/liked" className="block">
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Liked Articles</p>
                    <p className="mt-2 text-2xl lg:text-3xl font-bold text-gray-900">{dashboardData.stats.totalLikes}</p>
                    <p className="text-xs text-gray-500 mt-1">Articles you liked</p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Reading List Counter */}
            <Link href="/dashboard/reading-list" className="block">
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reading List</p>
                    <p className="mt-2 text-2xl lg:text-3xl font-bold text-gray-900">{dashboardData.stats.totalReadingList}</p>
                    <p className="text-xs text-gray-500 mt-1">Saved for later</p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                    <Bookmark className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subscriptions</p>
                  <p className="mt-2 text-2xl lg:text-3xl font-bold text-gray-900">{dashboardData.stats.totalSubscriptions}</p>
                  <p className="text-xs text-gray-500 mt-1">Active subscriptions</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                  <UserPlus className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-2 space-y-6 lg:space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                  <p className="text-sm text-gray-600 mt-1">Get started with common tasks</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dashboardData.user.isCreator ? (
                      <Link href="/dashboard/articles" className="group">
                        <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50 to-white group-hover:from-blue-50 group-hover:to-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">Manage Posts</h3>
                                <p className="text-gray-600 text-sm mt-1">Edit, publish, or delete your content</p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link href="/creators" className="group">
                        <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50 to-white group-hover:from-blue-50 group-hover:to-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                                <Search className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">Discover Creators</h3>
                                <p className="text-gray-600 text-sm mt-1">Find and subscribe to new creators</p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    )}

                    <Link href="/dashboard/account" className="group">
                      <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50 to-white group-hover:from-gray-100 group-hover:to-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                              <Settings className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">Profile Settings</h3>
                              <p className="text-gray-600 text-sm mt-1">Update your profile and preferences</p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-600 mt-1">Your latest interactions and content</p>
                </div>
                
                <div className="p-6">
                  {dashboardData.likedArticles.length === 0 && dashboardData.readingList.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                      <p className="text-gray-600 mb-6 text-sm">Start exploring content to see your activity here</p>
                      <Link href="/creators">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                          <Search className="w-4 h-4 mr-2" />
                          Discover Creators
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData.likedArticles.slice(0, 3).map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Heart className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm">Liked "{article.title}"</p>
                              <p className="text-xs text-gray-600">by {article.creator.name}</p>
                            </div>
                          </div>
                          <Link href={`/${article.creator.slug}/content/${article.slug}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* Creator Tools */}
              {dashboardData.user.isCreator && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Creator Tools</h3>
                  </div>
                  <p className="text-blue-800 text-sm mb-6 leading-relaxed">
                    Manage your content and grow your audience with powerful tools.
                  </p>
                  <div className="space-y-3">
                    <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Link href="/dashboard/articles">
                        <FileText className="w-4 h-4 mr-2" />
                        Manage Posts
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                      <Link href="/dashboard/analytics">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Subscriptions */}
              {dashboardData.subscriptions.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Your Subscriptions</h3>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.subscriptions.slice(0, 3).map((creator) => (
                      <Link key={creator.id} href={`/${creator.slug}`} className="block">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <UserPlus className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{creator.name}</span>
                        </div>
                      </Link>
                    ))}
                    {dashboardData.subscriptions.length > 3 && (
                      <Link href="/dashboard/subscriptions">
                        <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          View all subscriptions
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Tools & Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Tools & Settings</h3>
                </div>
                <div className="space-y-3">
                  <Link href="/dashboard/account" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Profile settings</span>
                  </Link>
                  {dashboardData.user.isCreator && (
                    <>
                      <button 
                        onClick={handleSyncPublica} 
                        disabled={isLoading} 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 text-gray-600 flex-shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="text-sm text-gray-700">
                          {isLoading ? 'Syncing...' : 'Sync to Publica.la'}
                        </span>
                      </button>
                      <button 
                        onClick={handleTestPublica} 
                        disabled={isLoading} 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 text-gray-600 flex-shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="text-sm text-gray-700">
                          {isLoading ? 'Testing...' : 'Test connection'}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </PageSection>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
