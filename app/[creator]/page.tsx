'use server'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Play, Image as ImageIcon, Video, Lock, Star, MoreHorizontal, Users } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SubscriptionButton from '@/components/subscription-button'
import ArticleCardEngagement from '@/components/article-card-engagement'

interface CreatorPageProps {
  params: { creator: string }
  searchParams: { filter?: string }
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  try {
    const creators = await prisma.$queryRaw`
      SELECT name, branding 
      FROM creators 
      WHERE slug = ${params.creator}
      LIMIT 1
    `

    const creator = (creators as any[])[0]

    if (!creator) {
      return {
        title: 'Creator Not Found',
        description: 'The requested creator profile could not be found.'
      }
    }

    const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
    const description = branding.description || `Explore content from ${creator.name} on publica.now`

    return {
      title: `${creator.name} (@${params.creator})`,
      description,
      openGraph: {
        title: `${creator.name} (@${params.creator})`,
        description,
        images: branding.profileImage ? [branding.profileImage] : ['/images/og-image.png'],
        type: 'profile',
      },
      alternates: {
        canonical: `/${params.creator}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Creator Not Found',
      description: 'The requested creator profile could not be found.'
    }
  }
}

export default async function CreatorPage({ params, searchParams }: CreatorPageProps) {
  const session = await getServerSession(authOptions)
  const filter = searchParams.filter || 'all'

  // Use raw SQL to get creator data
  const creators = await prisma.$queryRaw`
    SELECT 
      id, 
      name, 
      slug, 
      "storeDomain", 
      "createdAt",
      branding
    FROM creators 
    WHERE slug = ${params.creator}
    LIMIT 1
  `

  const creator = (creators as any[])[0]

  if (!creator) {
    notFound()
  }

  // Get articles using raw SQL
  const articles = await prisma.$queryRaw`
    SELECT 
      id,
      title, 
      slug,
      "contentType",
      status,
      visibility,
      "bodyMarkdown",
      "coverUrl",
      tags,
      pricing,
      "audioUrl",
      "videoId",
      "publishedAt",
      "createdAt"
    FROM articles 
    WHERE "creatorId" = ${creator.id}
    AND status IN ('ready', 'published')
    ORDER BY 
      CASE WHEN "publishedAt" IS NOT NULL THEN "publishedAt" ELSE "createdAt" END DESC
  `

  // Add articles to creator object for compatibility
  creator.articles = articles

  const publishedArticles = creator.articles.filter((article: any) =>
    article.publishedAt || article.status === 'ready'
  )

  // Filter articles by content type
  const filteredArticles = filter === 'all'
    ? publishedArticles
    : publishedArticles.filter((article: any) => article.contentType === filter)

  // Check if user is subscribed to this creator using raw SQL
  let isSubscribed = false
  if (session?.user) {
    const subscriptionResult = await prisma.$queryRaw`
      SELECT id 
      FROM memberships 
      WHERE "userId" = ${session.user.id}
      AND "creatorId" = ${creator.id}
      AND role = 'subscriber'
      LIMIT 1
    `
    isSubscribed = (subscriptionResult as any[]).length > 0
  }

  // Get subscriber count
  const subscriberCountResult = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM memberships
    WHERE "creatorId" = ${creator.id}
    AND role = 'subscriber'
  `
  const subscriberCount = Number((subscriberCountResult as any[])[0]?.count || 0)

  // Batch-fetch like counts for all displayed articles
  const articleIds = publishedArticles.map((a: any) => a.id)
  let likesMap: Record<string, number> = {}
  if (articleIds.length > 0) {
    try {
      const likesCounts = await prisma.$queryRaw`
        SELECT article_id, COUNT(*)::int as count
        FROM likes
        WHERE article_id IN (${Prisma.join(articleIds)})
        GROUP BY article_id
      `
      for (const row of likesCounts as any[]) {
        likesMap[row.article_id] = Number(row.count)
      }
    } catch (e) {
      console.error('Failed to batch-fetch like counts:', e)
    }
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'audio': return Play
      case 'image': return ImageIcon
      case 'video': return Video
      default: return null
    }
  }

  const getPricingDisplay = (pricing: any) => {
    if (!pricing) return null

    try {
      // Handle both string and object pricing
      let pricingObj = pricing
      if (typeof pricing === 'string') {
        pricingObj = JSON.parse(pricing)
      }

      // Check for USD price in the pricing object
      if (pricingObj && typeof pricingObj === 'object') {
        if (pricingObj.USD && pricingObj.USD > 0) {
          return `$${pricingObj.USD}`
        }
        // Also check if it's nested in a publica object
        if (pricingObj.publica && pricingObj.publica.USD && pricingObj.publica.USD > 0) {
          return `$${pricingObj.publica.USD}`
        }
      }
    } catch (e) {
      console.error('Error parsing pricing:', e)
      return null
    }
    return null
  }

  const contentTypes = [
    { value: 'all', label: 'All', count: publishedArticles.length },
    { value: 'text', label: 'Text', count: publishedArticles.filter((a: any) => a.contentType === 'text').length },
    { value: 'audio', label: 'Audio', count: publishedArticles.filter((a: any) => a.contentType === 'audio').length },
    { value: 'image', label: 'Image', count: publishedArticles.filter((a: any) => a.contentType === 'image').length },
    { value: 'video', label: 'Video', count: publishedArticles.filter((a: any) => a.contentType === 'video').length },
  ]

  // Parse branding data
  const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
  const mainColor = branding.mainColor || '#3B82F6'
  const headerImage = branding.headerImage || ''
  const profileImage = branding.profileImage || ''

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <div className="border-b border-white/[0.03]">
        {/* Header Background Image */}
        {headerImage && (
          <div
            className="w-full h-48 bg-cover bg-center bg-no-repeat grayscale hover:grayscale-0 transition-all duration-700"
            style={{ backgroundImage: `url(${headerImage})` }}
          />
        )}

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Creator Profile */}
          <div className="flex items-start gap-8 mb-12">
            {/* Avatar — Brutalist Square */}
            <div className="w-24 h-24 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ borderBottomColor: mainColor, borderBottomWidth: '3px' }}>
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={creator.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-white/[0.02]"
                >
                  <span className="text-3xl font-heading text-[#FAFAFA]">
                    {creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Creator Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#FAFAFA] mb-2 tracking-tight">{creator.name}</h1>
              <p className="text-white/30 mb-6 font-mono text-xs uppercase tracking-widest">@{creator.slug}</p>
              <p className="text-white/50 mb-6 max-w-2xl leading-relaxed">
                {branding.description || 'Independent operator on the publica.now matrix. Building signal through thoughtful transmissions.'}
              </p>

              {/* Stats — Monospace Grid */}
              <div className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-widest text-white/40 mb-8 py-4 border-y border-white/[0.05]">
                <span>{publishedArticles.length} transmissions</span>
                <span className="text-white/10">|</span>
                <span>{subscriberCount} subscribers</span>
                <span className="text-white/10">|</span>
                <span>{publishedArticles.filter((a: any) => a.visibility === 'free').length} free</span>
                {publishedArticles.filter((a: any) => a.visibility === 'paid').length > 0 && (
                  <>
                    <span className="text-white/10">|</span>
                    <span style={{ color: mainColor }}>{publishedArticles.filter((a: any) => a.visibility === 'paid').length} gated</span>
                  </>
                )}
                {publishedArticles.filter((a: any) => a.visibility === 'subscribers').length > 0 && (
                  <>
                    <span className="text-white/10">|</span>
                    <span>{publishedArticles.filter((a: any) => a.visibility === 'subscribers').length} subscribers-only</span>
                  </>
                )}
              </div>

              {/* Action Buttons — Sharp */}
              <div className="flex items-center gap-3">
                {!isSubscribed ? (
                  <SubscriptionButton creatorId={creator.id} mainColor={mainColor} />
                ) : (
                  <Button size="lg" variant="outline" className="rounded-none text-emerald-400 border-emerald-500/30 font-mono text-xs uppercase tracking-widest">
                    ✓ Subscribed
                  </Button>
                )}
                <Button variant="outline" size="lg" className="rounded-none font-mono text-xs uppercase tracking-widest border-white/10 text-white/60 hover:text-white hover:border-white/30">
                  Message
                </Button>
                <Button variant="ghost" size="sm" className="rounded-none">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tab — Architectural */}
          <div className="flex items-center gap-8 border-b border-white/[0.05]">
            <button
              className="pb-4 px-1 border-b-2 font-mono text-xs uppercase tracking-widest"
              style={{ borderColor: mainColor, color: mainColor }}
            >
              Transmissions
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Content Type Filters — Sharp Tabs */}
        <div className="flex items-center gap-0 mb-12 overflow-x-auto border border-white/[0.05]">
          {contentTypes.map((type) => (
            <Link
              key={type.value}
              href={`/${creator.slug}?filter=${type.value}`}
              className={`px-6 py-3 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-colors border-r border-white/[0.05] last:border-r-0 focus-visible:outline-none ${filter === type.value
                ? 'text-[#FAFAFA] bg-white/[0.05]'
                : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
                }`}
              style={filter === type.value ? { borderBottomColor: mainColor, borderBottomWidth: '2px' } : {}}
            >
              {type.label} [{type.count}]
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-24 border border-white/[0.05] bg-white/[0.01]">
            <Lock className="w-8 h-8 text-white/10 mx-auto mb-6" />
            <h3 className="text-2xl font-heading text-[#FAFAFA] mb-2">Null Result</h3>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">No transmissions matching filter parameters.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Latest Post Label */}
            {filteredArticles.length > 0 && (
              <div className="flex items-center gap-3 mb-8 font-mono text-xs uppercase tracking-widest text-white/40">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Latest Transmission</span>
              </div>
            )}

            {/* All Articles — Sharp Border Cards */}
            {filteredArticles.map((article: any, index: number) => {
              const IconComponent = getContentTypeIcon(article.contentType)
              const pricing = getPricingDisplay(article.pricing)
              const isPaid = article.visibility === 'paid'
              const isSubscribers = article.visibility === 'subscribers'
              const isGated = isPaid || isSubscribers

              return (
                <article key={article.id} className={`border-b border-white/[0.05] group ${isGated ? 'bg-white/[0.01] border border-white/[0.05] p-8 mb-6' : 'py-8'} hover:bg-white/[0.01] transition-colors`}>
                  {/* Metadata row */}
                  <div className="flex items-center flex-wrap gap-3 mb-4 font-mono text-xs uppercase tracking-widest">
                    <span className="text-white/30">
                      {article.publishedAt
                        ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
                        : formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
                      }
                    </span>
                    {/* Three-tier visibility tags */}
                    {isSubscribers ? (
                      <span className="flex items-center gap-1.5 text-blue-400/80 border border-blue-400/20 px-2 py-0.5"><Users className="w-3 h-3" /> Subscribers</span>
                    ) : isPaid ? (
                      <span className="flex items-center gap-1.5 text-amber-400/80 border border-amber-400/20 px-2 py-0.5"><Lock className="w-3 h-3" /> {pricing ? `${pricing}` : 'Gated'}</span>
                    ) : (
                      <span className="text-emerald-400/80 border border-emerald-400/20 px-2 py-0.5">Free</span>
                    )}
                    {/* Content Type */}
                    {IconComponent && (
                      <span className="flex items-center gap-1.5 text-white/30 border border-white/10 px-2 py-0.5">
                        <IconComponent className="w-3 h-3" />
                        <span className="capitalize">{article.contentType}</span>
                      </span>
                    )}
                  </div>

                  {/* Article Title */}
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#FAFAFA] mb-4 leading-tight tracking-tight group-hover:text-white transition-colors">
                    <Link href={`/${creator.slug}/content/${article.slug}`} className="hover:opacity-80 transition-opacity">
                      {article.title}
                    </Link>
                  </h2>

                  {/* Cover Image */}
                  {article.coverUrl && (
                    <div className="mb-6 relative overflow-hidden border border-white/[0.05]">
                      <div className="relative w-full max-w-2xl aspect-[16/9]">
                        <Image
                          src={article.coverUrl}
                          alt={article.title}
                          fill
                          className={`object-cover ${isGated ? 'blur-sm' : ''}`}
                          sizes="(max-width: 768px) 100vw, 768px"
                          unoptimized
                        />
                      </div>
                      {isGated && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white/60" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Grid for Image Posts */}
                  {article.contentType === 'image' && article.imageUrls && (
                    <div className="mb-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/10 max-w-2xl mb-4 border border-white/10">
                        {article.imageUrls.slice(0, 3).map((url: string, imgIdx: number) => (
                          <div key={imgIdx} className="aspect-square bg-[#080808] overflow-hidden">
                            <img
                              src={url}
                              alt={`Image ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <Button asChild variant="outline" size="sm" className="rounded-none font-mono text-xs uppercase tracking-widest border-white/10">
                        <Link href={`/${params.creator}/content/${article.slug}`}>View Images</Link>
                      </Button>
                    </div>
                  )}

                  {/* Video Content */}
                  {article.contentType === 'video' && (
                    <div className="mb-6">
                      <div className="text-white/50 leading-relaxed mb-4">
                        {article.bodyMarkdown
                          ? `${(article.bodyMarkdown || '').substring(0, 150)}...`
                          : 'Video content available'
                        }
                      </div>
                      <Button asChild variant="outline" size="sm" className="rounded-none font-mono text-xs uppercase tracking-widest border-white/10">
                        <Link href={`/${params.creator}/content/${article.slug}`}>Watch Video</Link>
                      </Button>
                    </div>
                  )}

                  {/* Text Content */}
                  {article.contentType === 'text' && (
                    <div className="mb-6">
                      <div className="text-white/50 leading-relaxed mb-4">
                        {article.bodyMarkdown
                          ? `${(article.bodyMarkdown || '').substring(0, 150)}...`
                          : 'No description available'
                        }
                      </div>
                      <Button asChild variant="outline" size="sm" className="rounded-none font-mono text-xs uppercase tracking-widest border-white/10">
                        <Link href={`/${params.creator}/content/${article.slug}`}>Read Full Article</Link>
                      </Button>
                    </div>
                  )}

                  {/* Audio Content */}
                  {article.contentType === 'audio' && (
                    <div className="mb-6">
                      <div className="text-white/50 leading-relaxed mb-4">
                        {article.bodyMarkdown
                          ? `${(article.bodyMarkdown || '').substring(0, 150)}...`
                          : 'Audio content available'
                        }
                      </div>
                      <Button asChild variant="outline" size="sm" className="rounded-none font-mono text-xs uppercase tracking-widest border-white/10">
                        <Link href={`/${params.creator}/content/${article.slug}`}>Listen to Audio</Link>
                      </Button>
                    </div>
                  )}

                  {/* Tags */}
                  {article.tags && typeof article.tags === 'string' && article.tags.trim() && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {article.tags.split(',').slice(0, 3).map((tag: string) => (
                        <span key={tag} className="font-mono text-[10px] uppercase tracking-widest text-white/30 border border-white/10 px-2 py-1">#{tag.trim()}</span>
                      ))}
                    </div>
                  )}

                  {/* Paywall CTA for Gated Articles */}
                  {isGated && (
                    <div className="border border-white/[0.05] bg-white/[0.02] p-8 mb-6">
                      <div className="text-center">
                        {isSubscribers ? (
                          <Users className="w-8 h-8 text-white/20 mx-auto mb-4" />
                        ) : (
                          <Lock className="w-8 h-8 text-white/20 mx-auto mb-4" />
                        )}
                        <h3 className="text-xl font-heading text-[#FAFAFA] mb-3">
                          {isSubscribers ? 'Subscribe to Decrypt' : 'Unlock Transmission'}
                        </h3>
                        <p className="text-white/40 mb-6 font-mono text-xs uppercase tracking-widest">
                          {isSubscribers
                            ? `Restricted to ${creator.name}'s subscriber matrix.`
                            : `Access all gated content from ${creator.name}.`
                          }
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <SubscriptionButton creatorId={creator.id} mainColor={mainColor} />
                          {isPaid && pricing && (
                            <Button asChild variant="outline" size="lg" className="rounded-none font-mono text-xs uppercase tracking-widest border-white/10">
                              <Link href={`/${creator.slug}/content/${article.slug}`}>
                                Buy for {pricing}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Engagement and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                    <ArticleCardEngagement
                      articleId={article.id}
                      initialLikesCount={likesMap[article.id] || 0}
                      creatorSlug={creator.slug}
                      articleSlug={article.slug}
                    />

                    <Button asChild variant="outline" size="sm" className="rounded-none font-mono text-xs uppercase tracking-widest border-white/10 hover:bg-white/5">
                      <Link href={`/${creator.slug}/content/${article.slug}`}>
                        {isGated ? 'Read more' : 'Read full post'}
                      </Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Footer moved to global SiteFooter */}
      </div>
    </div>
  )
}
