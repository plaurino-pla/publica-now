'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Users, 
  Filter, 
  Globe, 
  FileText, 
  Play, 
  Image as ImageIcon, 
  Video,
  Star,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

// Note: This is a client component, so we can't use export const metadata
// SEO is handled in the parent layout

interface Creator {
  id: string
  name: string
  slug: string
  storeDomain: string
  branding: string | null
  createdAt: string
  updatedAt: string
  articles: Array<{
    contentType: string
  }>
  _count: {
    articles: number
  }
  contentTypeStats: {
    text: number
    audio: number
    image: number
    video: number
  }
  isNewCreator: boolean
  totalArticles: number
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name'>('recent')

  useEffect(() => {
    fetchCreators()
  }, [])

  useEffect(() => {
    filterAndSortCreators()
  }, [creators, searchTerm, sortBy])

  const fetchCreators = async () => {
    try {
      console.log('Fetching creators...')
      const response = await fetch('/api/creators')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Creators API response:', data)
        
        if (data.creators && Array.isArray(data.creators)) {
          setCreators(data.creators)
          console.log('Set creators:', data.creators.length)
        } else {
          console.error('Invalid creators data structure:', data)
          setCreators([])
        }
      } else {
        const errorText = await response.text()
        console.error('Creators API error:', response.status, errorText)
        setCreators([])
      }
    } catch (error) {
      console.error('Error fetching creators:', error)
      setCreators([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortCreators = () => {
    let filtered = creators.filter(creator => {
      const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
      const description = branding.description || ''
      
      return (
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    // Sort creators
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          // Sort by published article count, then by creation date for new creators
          const aCount = a._count.articles
          const bCount = b._count.articles
          if (aCount !== bCount) {
            return bCount - aCount
          }
          // If same article count, newer creators first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredCreators(filtered)
  }

  const getContentTypeStats = (creator: Creator) => {
    return creator.contentTypeStats
  }

  const getCreatorDescription = (creator: Creator) => {
    if (!creator.branding) {
      return 'Independent creator publishing on publica.now'
    }
    
    const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
    return branding.description || 'Independent creator publishing on publica.now'
  }

  const getCreatorImage = (creator: Creator) => {
    if (!creator.branding) return null
    
    const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
    return branding.profileImage || null
  }

  const getCreatorColor = (creator: Creator) => {
    if (!creator.branding) return '#3B82F6'
    
    const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
    return branding.mainColor || '#3B82F6'
  }

  if (isLoading) {
    return (
      <PageSection background="muted">
        <Container className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creators...</p>
        </Container>
      </PageSection>
    )
  }

  if (creators.length === 0) {
    return (
      <PageSection background="muted">
        <Container className="text-center">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No Creators Found</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">It looks like there are no creators with published content yet.</p>
          <Button onClick={fetchCreators} variant="outline">
            Refresh
          </Button>
        </Container>
      </PageSection>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageSection background="white">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Creators
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Explore independent creators, writers, podcasters, and content makers 
              who are building meaningful communities on publica.now
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search creators by name, handle, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-3 text-base sm:text-lg"
              />
            </div>
          </div>
        </Container>
      </PageSection>

      {/* Filters and Stats */}
      <PageSection background="white" className="py-6 border-y border-gray-200">
        <Container>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
              </span>
              
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'name')}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="recent">Recently Added</option>
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{creators.length} total creators</span></div>
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /><span>{creators.reduce((sum, c) => sum + c.totalArticles, 0)} total posts</span></div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /><span>{creators.filter(c => c.isNewCreator).length} new creators</span></div>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* Creators Grid */}
      <PageSection background="muted">
        <Container>
          {filteredCreators.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No creators found</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Try adjusting your search terms or browse all creators
              </p>
              <Button 
                onClick={() => setSearchTerm('')}
                variant="outline"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCreators.map((creator) => {
                const description = getCreatorDescription(creator)
                const creatorImage = getCreatorImage(creator)
                const creatorColor = getCreatorColor(creator)
                const stats = getContentTypeStats(creator)
                
                return (
                  <Card key={creator.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Creator Avatar */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {creatorImage ? (
                            <img 
                              src={creatorImage} 
                              alt={creator.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: creatorColor }}
                            >
                              <span className="text-lg sm:text-xl font-bold text-white">
                                {creator.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Creator Info */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg mb-1 truncate">
                            {creator.name}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm mb-2">
                            @{creator.slug}
                          </CardDescription>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                            {description}
                          </p>
                          {creator.isNewCreator && (
                            <p className="text-xs text-blue-600 mt-1">
                              ✨ Just getting started - be the first to discover them!
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Content Type Stats */}
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 text-xs text-gray-500">
                        {creator.isNewCreator ? (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Sparkles className="w-3 h-3" />
                            <span>New Creator</span>
                          </div>
                        ) : (
                          <>
                            {stats.text > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>{stats.text}</span>
                              </div>
                            )}
                            {stats.audio > 0 && (
                              <div className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                <span>{stats.audio}</span>
                              </div>
                            )}
                            {stats.image > 0 && (
                              <div className="flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>{stats.image}</span>
                              </div>
                            )}
                            {stats.video > 0 && (
                              <div className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                <span>{stats.video}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Total Posts */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {creator.isNewCreator ? 'No posts yet' : `${creator._count.articles} total posts`}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">
                            {creator.isNewCreator ? 'New' : 'Active'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <Button 
                        asChild 
                        className="w-full h-12 sm:h-14 text-sm sm:text-base"
                        style={{ backgroundColor: creatorColor }}
                      >
                        <Link href={`/${creator.slug}`}>
                          <Globe className="w-4 h-4 mr-2" />
                          Visit Creator Page
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </Container>
      </PageSection>

      {/* CTA Section */}
      <PageSection background="white" className="border-t border-gray-200">
        <Container className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Creator Journey?
          </h2>
          <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Join thousands of creators who are building their audience and monetizing their content on publica.now
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-12 sm:h-14"><Link href="/auth/signup">Start Creating Today</Link></Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14"><Link href="/how-it-works">Learn How It Works</Link></Button>
          </div>
        </Container>
      </PageSection>
    </div>
  )
}
