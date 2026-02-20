'use server'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import Chip from '@/components/ui/chip'
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
    const likesCounts = await prisma.$queryRaw`
      SELECT article_id, COUNT(*)::int as count
      FROM likes
      WHERE article_id IN (${Prisma.join(articleIds)})
      GROUP BY article_id
    `
    for (const row of likesCounts as any[]) {
      likesMap[row.article_id] = Number(row.count)
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        {/* Header Background Image */}
        {headerImage && (
          <div 
            className="w-full h-48 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${headerImage})` }}
          />
        )}
        
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Creator Profile */}
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profileImage ? (
                <Image 
                  src={profileImage} 
                  alt={creator.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: mainColor }}
                >
                  <span className="text-2xl font-bold text-white">
                    {creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Creator Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold text-[#FAFAFA] mb-1">{creator.name}</h1>
              <p className="text-white/40 mb-4">@{creator.slug}</p>
              <p className="text-white/60 mb-4 max-w-2xl">
                {branding.description || 'Independent creator publishing on publica.now. Building a community around thoughtful content and meaningful discussions.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="info">Subscribe for full access</Badge>
                {branding.subscriptionPrice && (
                  <Badge variant="warning">${'{'}branding.subscriptionPrice{'}'}/month</Badge>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-white/50 mb-6">
                <span>{publishedArticles.length} posts</span>
                <span>•</span>
                <span>{subscriberCount} subscribers</span>
                <span>•</span>
                <span>{publishedArticles.filter((a: any) => a.visibility === 'free').length} free</span>
                {publishedArticles.filter((a: any) => a.visibility === 'paid').length > 0 && (
                  <>
                    <span>•</span>
                    <span>{publishedArticles.filter((a: any) => a.visibility === 'paid').length} premium</span>
                  </>
                )}
                {publishedArticles.filter((a: any) => a.visibility === 'subscribers').length > 0 && (
                  <>
                    <span>•</span>
                    <span>{publishedArticles.filter((a: any) => a.visibility === 'subscribers').length} subscribers-only</span>
                  </>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {!isSubscribed ? (
                  <SubscriptionButton creatorId={creator.id} mainColor={mainColor} />
                ) : (
                  <Button size="lg" variant="outline" className="text-green-400 border-green-500/30">
                    ✓ Subscribed
                  </Button>
                )}
                <Button variant="outline" size="lg">
                  Message
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 border-b border-white/[0.06]">
            <button
              className="pb-4 px-1 border-b-2 font-medium"
              style={{ borderColor: mainColor, color: mainColor }}
            >
              Posts
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Content Type Filters */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto">
          {contentTypes.map((type) => (
            <Link
              key={type.value}
              href={`/${creator.slug}?filter=${type.value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                filter === type.value
                  ? 'text-white'
                  : 'bg-surface-2 text-white/60 hover:bg-surface-3'
              }`}
              style={filter === type.value ? { backgroundColor: mainColor } : {}}
            >
              {type.label} ({type.count})
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-2">No content found</h3>
            <p className="text-white/50">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Latest Post Label */}
            {filteredArticles.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Latest post</span>
              </div>
            )}

            {/* All Articles */}
            {filteredArticles.map((article: any, index: number) => {
              const IconComponent = getContentTypeIcon(article.contentType)
              const pricing = getPricingDisplay(article.pricing)
              const isPaid = article.visibility === 'paid'
              const isSubscribers = article.visibility === 'subscribers'
              const isGated = isPaid || isSubscribers

              return (
                <article key={article.id} className={`border-b border-white/[0.06] last:border-b-0 ${isGated ? 'bg-surface-1 rounded-xl p-6 mb-8 border border-white/[0.06]' : 'pb-8'}`}>
                  {/* Metadata row */}
                  <div className="flex items-center flex-wrap gap-2 mb-3 text-sm">
                    <span className="text-white/40">
                      {article.publishedAt
                        ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
                        : formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
                      }
                    </span>
                    {/* Three-tier visibility badges */}
                    {isSubscribers ? (
                      <Badge variant="info" className="flex items-center gap-1"><Users className="w-3 h-3" /> Subscribers Only</Badge>
                    ) : isPaid ? (
                      <Badge variant="warning" className="flex items-center gap-1"><Lock className="w-3 h-3" /> {pricing ? `Paid ${pricing}` : 'Paid'}</Badge>
                    ) : (
                      <Badge variant="success">Free</Badge>
                    )}
                    {/* Content Type Chip */}
                    {IconComponent && (
                      <Chip size="sm" variant="neutral" leadingIcon={<IconComponent className="w-4 h-4" />}>
                        <span className="capitalize">{article.contentType}</span>
                      </Chip>
                    )}
                  </div>

                  {/* Article Title — above content */}
                  <h2 className="text-xl md:text-2xl font-bold text-[#FAFAFA] mb-3 leading-tight">
                    <Link href={`/${creator.slug}/content/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </h2>

                  {/* Cover Image */}
                  {article.coverUrl && (
                    <div className="mb-4 relative rounded-lg overflow-hidden">
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
                        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Grid for Image Posts */}
                  {article.contentType === 'image' && article.imageUrls && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mb-3">
                        {article.imageUrls.slice(0, 3).map((url: string, imgIdx: number) => (
                          <div key={imgIdx} className="aspect-square bg-surface-2 rounded-lg overflow-hidden">
                            <img
                              src={url}
                              alt={`Image ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <Button asChild variant="outline" size="sm" className="text-sm">
                        <Link href={`/${params.creator}/content/${article.slug}`}>View Images</Link>
                      </Button>
                    </div>
                  )}

                  {/* Video Content */}
                  {article.contentType === 'video' && (
                    <div className="mb-4">
                      <div className="text-white/60 leading-relaxed mb-3">
                        {article.bodyMarkdown
                          ? `${(article.bodyMarkdown || '').substring(0, 150)}...`
                          : 'Video content available'
                        }
                      </div>
                      <Button asChild variant="outline" size="sm" className="text-sm">
                        <Link href={`/${params.creator}/content/${article.slug}`}>Watch Video</Link>
                      </Button>
                    </div>
                  )}

                  {/* Text Content */}
                  {article.contentType === 'text' && (
                    <div className="mb-4">
                      <div className="text-white/60 leading-relaxed mb-3">
                        {article.bodyMarkdown
                          ? `${(article.bodyMarkdown || '').substring(0, 150)}...`
                          : 'No description available'
                        }
                      </div>
                      <Button asChild variant="outline" size="sm" className="text-sm">
                        <Link href={`/${params.creator}/content/${article.slug}`}>Read Full Article</Link>
                      </Button>
                    </div>
                  )}

                  {/* Audio Content */}
                  {article.contentType === 'audio' && (
                    <div className="mb-4">
                      <div className="text-white/60 leading-relaxed mb-3">
                        {article.bodyMarkdown
                          ? `${(article.bodyMarkdown || '').substring(0, 150)}...`
                          : 'Audio content available'
                        }
                      </div>
                      <Button asChild variant="outline" size="sm" className="text-sm">
                        <Link href={`/${params.creator}/content/${article.slug}`}>Listen to Audio</Link>
                      </Button>
                    </div>
                  )}

                  {/* Tags */}
                  {article.tags && typeof article.tags === 'string' && article.tags.trim() && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.split(',').slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline">#{tag.trim()}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Paywall CTA for Gated Articles */}
                  {isGated && (
                    <div className="bg-surface-1 border border-white/[0.08] rounded-lg p-4 mb-4">
                      <div className="text-center">
                        {isSubscribers ? (
                          <Users className="w-8 h-8 text-white/30 mx-auto mb-2" />
                        ) : (
                          <Lock className="w-8 h-8 text-white/30 mx-auto mb-2" />
                        )}
                        <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">
                          {isSubscribers ? 'Subscribe to access' : 'Unlock this content'}
                        </h3>
                        <p className="text-white/50 mb-4">
                          {isSubscribers
                            ? `This content is available exclusively to ${creator.name}'s subscribers.`
                            : `Get access to all premium content from ${creator.name} and support independent creators.`
                          }
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <SubscriptionButton creatorId={creator.id} mainColor={mainColor} />
                          {isPaid && pricing && (
                            <Button asChild variant="outline" size="lg">
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
                  <div className="flex items-center justify-between">
                    <ArticleCardEngagement
                      articleId={article.id}
                      initialLikesCount={likesMap[article.id] || 0}
                      creatorSlug={creator.slug}
                      articleSlug={article.slug}
                    />

                    <Button asChild variant="outline" size="sm">
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
