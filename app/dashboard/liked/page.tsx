'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ArrowLeft, ExternalLink, Calendar, User } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

interface LikedArticle {
  id: string
  title: string
  slug: string
  creator: {
    slug: string
    name: string
  }
}

export default function LikedArticlesPage() {
  const [likedArticles, setLikedArticles] = useState<LikedArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLikedArticles = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setLikedArticles(data.likedArticles || [])
        } else {
          setError('Failed to fetch liked articles')
        }
      } catch (err) {
        setError('Failed to load liked articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLikedArticles()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your liked articles...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-stone-50">
        <PageHeader 
          title="Liked Articles" 
          subtitle="Articles you've liked and want to remember"
        />

        <Container>
          <PageSection>
            <div className="mb-6">
              <Link href="/dashboard">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load liked articles</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : likedArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No liked articles yet</h3>
                <p className="text-gray-600 mb-6">Start exploring content and like articles to see them here.</p>
                <div className="flex justify-center gap-3">
                  <Link href="/creators">
                    <Button>Discover Creators</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {likedArticles.length} Liked Article{likedArticles.length !== 1 ? 's' : ''}
                  </h2>
                </div>

                <div className="grid gap-4">
                  {likedArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{article.creator.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Link href={`/${article.creator.slug}/content/${article.slug}`}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Read Article
                                </Button>
                              </Link>
                              <Link href={`/${article.creator.slug}`}>
                                <Button size="sm" variant="ghost">
                                  Visit Creator
                                </Button>
                              </Link>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-red-600 fill-current" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </PageSection>
        </Container>
      </div>
    </AuthGuard>
  )
}
