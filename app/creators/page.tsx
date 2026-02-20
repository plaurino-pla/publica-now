'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Container } from '@/components/ui/container'

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
      const response = await fetch('/api/creators')

      if (response.ok) {
        const data = await response.json()

        if (data.creators && Array.isArray(data.creators)) {
          setCreators(data.creators)
        } else {
          setCreators([])
        }
      } else {
        setCreators([])
      }
    } catch (error) {
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
      return 'Independent creator publishing on operations matrix.'
    }

    const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
    return branding.description || 'Independent creator publishing on operations matrix.'
  }

  const getCreatorImage = (creator: Creator) => {
    if (!creator.branding) return null

    const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
    return branding.profileImage || null
  }

  const getCreatorColor = (creator: Creator) => {
    if (!creator.branding) return '#FF5722' // brand-400 fallback

    const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
    return branding.mainColor || '#FF5722'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center font-mono text-sm tracking-widest text-brand-400 uppercase">
          Initializing Matrix...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header & Terminal Search */}
      <section className="pt-40 pb-16 border-b border-white/[0.03]">
        <Container>
          <div className="text-center md:text-left">
            <span className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-8 border border-white/10 px-3 py-1.5">
              Creator Index
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-bold text-[#FAFAFA] mb-8 tracking-tight">
              Network <span className="italic font-serif text-white/40">Nodes.</span>
            </h1>

            {/* Brutalist Search Terminal */}
            <div className="max-w-3xl mt-16 relative group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 w-8 h-8 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="text"
                placeholder="[ SEARCH CREATOR IDENTITIES ]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/10 pl-12 pr-4 py-4 text-2xl font-heading text-[#FAFAFA] placeholder:font-mono placeholder:text-sm placeholder:tracking-widest placeholder:uppercase placeholder:text-white/20 focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Filters and Stats */}
      <div className="bg-white/[0.01] py-6 border-b border-white/[0.03]">
        <Container>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                Found [ {filteredCreators.length} ] Nodes
              </span>

              {/* Sort Options */}
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-white/30" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'name')}
                  className="bg-transparent border border-white/10 font-mono text-xs uppercase tracking-widest text-[#FAFAFA] rounded-none px-4 py-2 focus:outline-none focus:border-white/30"
                >
                  <option value="recent" className="bg-[#080808]">Recently Online</option>
                  <option value="popular" className="bg-[#080808]">High Traffic</option>
                  <option value="name" className="bg-[#080808]">Alpha Sequence</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-white/30">
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>Total: {creators.length}</span></div>
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /><span>Payloads: {creators.reduce((sum, c) => sum + c.totalArticles, 0)}</span></div>
            </div>
          </div>
        </Container>
      </div>

      {/* Creators Grid */}
      <section className="py-24">
        <Container>
          {filteredCreators.length === 0 ? (
            <div className="text-center py-24 border border-white/5 bg-white/[0.01]">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-6" />
              <h3 className="text-2xl font-heading text-[#FAFAFA] mb-2">Null Result</h3>
              <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
                No matching identities found in registry.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05]">
              {filteredCreators.map((creator) => {
                const description = getCreatorDescription(creator)
                const creatorImage = getCreatorImage(creator)
                const creatorColor = getCreatorColor(creator)
                const stats = getContentTypeStats(creator)

                return (
                  <div key={creator.id} className="bg-[#080808] p-8 md:p-10 group hover:bg-white/[0.02] transition-colors flex flex-col justify-between border-t-2 border-transparent" style={{ '--hover-color': creatorColor } as any} onMouseEnter={(e) => e.currentTarget.style.borderColor = creatorColor} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                    <div>
                      <div className="flex items-start justify-between mb-8">
                        {/* Creator Avatar - Brutalist Square */}
                        <div className="w-16 h-16 border border-white/10 flex items-center justify-center bg-white/[0.02] overflow-hidden">
                          {creatorImage ? (
                            <img
                              src={creatorImage}
                              alt={creator.name}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center border-b-2"
                              style={{ borderBottomColor: creatorColor }}
                            >
                              <span className="text-2xl font-heading text-white">
                                {creator.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="font-mono text-[10px] text-white/20 uppercase tracking-[0.2em] mb-1">Status</div>
                          <div className="flex items-center gap-1 justify-end" style={{ color: creatorColor }}>
                            {creator.isNewCreator ? (
                              <><Sparkles className="w-3 h-3" /><span className="text-xs font-mono uppercase tracking-widest">New</span></>
                            ) : (
                              <><Star className="w-3 h-3 fill-current" /><span className="text-xs font-mono uppercase tracking-widest">Active</span></>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Creator Info */}
                      <div className="mb-8">
                        <h3 className="text-2xl font-heading text-[#FAFAFA] mb-1 truncate transition-colors" style={{ color: 'var(--hover-color, #FAFAFA)' } as any}>
                          {creator.name}
                        </h3>
                        <div className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">
                          @{creator.slug}
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed line-clamp-3">
                          {description}
                        </p>
                      </div>
                    </div>

                    <div>
                      {/* Content Type Stats Grid */}
                      <div className="grid grid-cols-4 gap-px bg-white/10 border border-white/10 mb-8 mt-4">
                        <div className="bg-[#080808] p-3 text-center group-hover:bg-white/[0.02] transition-colors">
                          <FileText className="w-4 h-4 mx-auto text-white/30 mb-2" />
                          <span className="font-mono text-xs text-white/60">{stats.text}</span>
                        </div>
                        <div className="bg-[#080808] p-3 text-center group-hover:bg-white/[0.02] transition-colors">
                          <Play className="w-4 h-4 mx-auto text-white/30 mb-2" />
                          <span className="font-mono text-xs text-white/60">{stats.audio}</span>
                        </div>
                        <div className="bg-[#080808] p-3 text-center group-hover:bg-white/[0.02] transition-colors">
                          <ImageIcon className="w-4 h-4 mx-auto text-white/30 mb-2" />
                          <span className="font-mono text-xs text-white/60">{stats.image}</span>
                        </div>
                        <div className="bg-[#080808] p-3 text-center group-hover:bg-white/[0.02] transition-colors">
                          <Video className="w-4 h-4 mx-auto text-white/30 mb-2" />
                          <span className="font-mono text-xs text-white/60">{stats.video}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        asChild
                        className="w-full h-12 rounded-none bg-white/5 border border-white/10 text-[#FAFAFA] hover:bg-white/10 font-mono text-xs uppercase tracking-widest transition-all flex justify-between items-center px-4"
                        style={{ borderBottomColor: creatorColor, borderBottomWidth: '2px' }}
                      >
                        <Link href={`/${creator.slug}`}>
                          <span>Access Node</span>
                          <ArrowRight className="w-4 h-4 opacity-50" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative border-t border-white/[0.05]">
        <Container className="text-center">
          <h2 className="text-4xl sm:text-5xl font-heading text-[#FAFAFA] mb-6">
            Register your <span className="italic text-white/40">Identity.</span>
          </h2>
          <p className="text-white/40 mb-12 max-w-xl mx-auto text-base">
            Establish a node on the matrix. Monetize raw capabilities.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-14 px-10 text-xs font-mono tracking-widest uppercase font-semibold mx-auto border-none"
          >
            <Link href="/auth/signup">
              Deploy Instance <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
          </Button>
        </Container>
      </section>
    </div>
  )
}
