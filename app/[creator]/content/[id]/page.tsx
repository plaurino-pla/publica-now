'use server'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Tag, Eye, EyeOff, Lock, Globe } from 'lucide-react'
import Badge from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TextArticleContent from '@/components/text-article-content'
import ArticleInteractionsWrapper from '@/components/article-interactions-wrapper'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Paywall from '@/components/paywall'

interface ContentPageProps {
  params: { creator: string; id: string }
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  try {
    // Use raw SQL to get creator data
    const creators = await prisma.$queryRaw`
      SELECT id, name, branding 
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

    // Use raw SQL to get article data
    const articles = await prisma.$queryRaw`
      SELECT title, "bodyMarkdown", "contentType", visibility
      FROM articles 
      WHERE slug = ${params.id} 
      AND "creatorId" = ${creator.id}
      AND status IN ('ready', 'published')
      LIMIT 1
    `

    const article = (articles as any[])[0]

    if (!article) {
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found.'
      }
    }

    const branding = creator.branding && typeof creator.branding === 'object' ? creator.branding as any : {}
    const description = article.bodyMarkdown 
      ? article.bodyMarkdown.substring(0, 160).replace(/#{1,6}\s/g, '').replace(/\n/g, ' ')
      : `Read "${article.title}" by ${creator.name} on publica.now`

    return {
      title: `${article.title} by ${creator.name}`,
      description,
      openGraph: {
        title: `${article.title} by ${creator.name}`,
        description,
        images: branding.profileImage ? [branding.profileImage] : ['/images/og-image.png'],
        type: 'article',
        authors: [creator.name],
      },
      alternates: {
        canonical: `/${params.creator}/content/${params.id}`,
      },
    }
  } catch (error) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }
}

// Helper function to safely format dates
function formatDateSafely(date: Date | string | null, fallbackDate: Date | string): string {
  try {
    if (!date) return formatDistanceToNow(new Date(fallbackDate), { addSuffix: true })
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return formatDistanceToNow(new Date(fallbackDate), { addSuffix: true })
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    return formatDistanceToNow(new Date(fallbackDate), { addSuffix: true })
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
  try {
    const session = await getServerSession(authOptions)
    
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

    // Use raw SQL to get article data
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
        "createdAt",
        "creatorId"
      FROM articles 
      WHERE slug = ${params.id} 
      AND "creatorId" = ${creator.id}
      AND status IN ('ready', 'published')
      LIMIT 1
    `

    const article = (articles as any[])[0]

    if (!article) {
      notFound()
    }
    
    // Debug logging for image posts
    if (article.contentType === 'image') {
      console.log('Image post debug:', {
        id: article.id,
        title: article.title,
        contentType: article.contentType
      })
    }

    const isFree = article.visibility === 'free'
    const isSubscribers = article.visibility === 'subscribers'
    const isPaid = article.visibility === 'paid'

    // Get user's subscriptions and purchases for access control
    let subscriptions: any[] = []
    let purchases: any[] = []
    
    if (session?.user) {
      try {
        // Get user's subscriptions
        subscriptions = await prisma.$queryRaw`
          SELECT s.* FROM subscriptions s 
          WHERE s.user_id = ${session.user.id}
        `
        
        // Get user's purchases
        purchases = await prisma.$queryRaw`
          SELECT p.* FROM purchases p 
          WHERE p.user_id = ${session.user.id}
        `
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Continue with empty arrays if there's an error
      }
    }

    // Fetch initial interaction states if user is logged in
    let initialLiked = false
    let initialLikesCount = 0
    let initialSubscribed = false
    let initialSubscribersCount = 0
    let initialSaved = false
    
    if (session?.user) {
      try {
        // Get like status and count
        const likeData = await prisma.$queryRaw`
          SELECT 
            CASE WHEN l.id IS NOT NULL THEN true ELSE false END as liked,
            COALESCE(likes_count.count, 0) as likes_count
          FROM articles a
          LEFT JOIN likes l ON a.id = l.article_id AND l.user_id = ${session.user.id}
          LEFT JOIN (
            SELECT article_id, COUNT(*) as count 
            FROM likes 
            GROUP BY article_id
          ) likes_count ON a.id = likes_count.article_id
          WHERE a.id = ${article.id}
        `
        
        if ((likeData as any[]).length > 0) {
          initialLiked = (likeData as any[])[0].liked
          initialLikesCount = Number((likeData as any[])[0].likes_count)
        }

        // Get subscription status and count
        const subscriptionData = await prisma.$queryRaw`
          SELECT 
            CASE WHEN m.id IS NOT NULL THEN true ELSE false END as subscribed,
            COALESCE(subscribers_count.count, 0) as subscribers_count
          FROM creators c
          LEFT JOIN memberships m ON c.id = m."creatorId" AND m."userId" = ${session.user.id} AND m.role = 'subscriber'
          LEFT JOIN (
            SELECT "creatorId", COUNT(*) as count 
            FROM memberships 
            WHERE role = 'subscriber'
            GROUP BY "creatorId"
          ) subscribers_count ON c.id = subscribers_count."creatorId"
          WHERE c.id = ${article.creatorId}
        `
        
        if ((subscriptionData as any[]).length > 0) {
          initialSubscribed = (subscriptionData as any[])[0].subscribed
          initialSubscribersCount = Number((subscriptionData as any[])[0].subscribers_count)
        }

        // Get save status
        const saveData = await prisma.$queryRaw`
          SELECT CASE WHEN rl.id IS NOT NULL THEN true ELSE false END as saved
          FROM articles a
          LEFT JOIN "readingListItems" rl ON a.id = rl.article_id AND rl.user_id = ${session.user.id}
          WHERE a.id = ${article.id}
        `
        
        if ((saveData as any[]).length > 0) {
          initialSaved = (saveData as any[])[0].saved
        }
      } catch (error) {
        console.error('Error fetching interaction states:', error)
        // Continue with default values if there's an error
      }
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Article Interactions */}
          <ArticleInteractionsWrapper
            articleId={article.id}
            creatorId={creator.id}
            creatorSlug={creator.slug}
            initialLiked={initialLiked}
            initialLikesCount={initialLikesCount}
            initialSubscribed={initialSubscribed}
            initialSubscribersCount={initialSubscribersCount}
            initialSaved={initialSaved}
            isFree={isFree}
            isSubscribers={isSubscribers}
            isPaid={isPaid}
          />

          {/* Article Content */}
          {isFree ? (
            // Free content - show immediately
            <div className="prose prose-lg max-w-none">
              {article.contentType === 'text' ? (
                // For text articles, prioritize publica.la content if available
                article.pricing && 
                typeof article.pricing === 'object' && 
                'publica' in article.pricing && 
                (article.pricing as any).publica?.readerUrl ? (
                  // Show publica.la embedded reader for complete content
                  <div className="w-full">
                    <div className="relative w-full" style={{ paddingBottom: '60%' }}>
                      <iframe
                        src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                        title={`${article.title} - Complete Article`}
                        className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        style={{ minHeight: '600px' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Publica.la</a>
                    </p>
                  </div>
                ) : (
                  // Fallback to bodyMarkdown if no publica.la content
                  article.bodyMarkdown ? (
                    <TextArticleContent article={article} />
                  ) : (
                    <p>Content not available.</p>
                  )
                )
              ) : article.contentType === 'audio' ? (
                <div className="space-y-4">
                  {/* Audio Player */}
                  {article.pricing && 
                   typeof article.pricing === 'object' && 
                   'publica' in article.pricing && 
                   (article.pricing as any).publica?.readerUrl ? (
                    // Use Publica.la embedded audio player
                    <div className="w-full">
                      <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                        <iframe
                          src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                          title={`${article.title} - Audio Player`}
                          className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                          style={{ minHeight: '600px' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Publica.la</a>
                      </p>
                    </div>
                  ) : article.audioUrl ? (
                    // Fallback to basic HTML audio player if no publica.la integration
                    <div className="w-full">
                      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900">Audio Content</h3>
                        </div>
                        <audio
                          src={article.audioUrl}
                          controls
                          className="w-full"
                          preload="metadata"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-200 rounded-lg">
                      <p className="text-gray-600">Audio content available</p>
                    </div>
                  )}
                  {/* Only show TextArticleContent for non-audio content types */}
                  {article.contentType !== 'audio' && article.bodyMarkdown && (
                    <TextArticleContent article={article} />
                  )}
                </div>
              ) : article.contentType === 'image' ? (
                <div className="space-y-4">
                  <div className="text-center py-8 border border-gray-200 rounded-lg">
                    <p className="text-gray-600">Image content available</p>
                  </div>
                  {article.bodyMarkdown && (
                    <TextArticleContent article={article} />
                  )}
                </div>
              ) : article.contentType === 'video' ? (
                <div className="space-y-4">
                  {/* Show Cloudflare Stream video if videoId is available */}
                  {article.videoId ? (
                    <div className="w-full">
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={`https://cloudflarestream.com/${article.videoId}/iframe`}
                          title={`${article.title} - Video Player`}
                          className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                          style={{ minHeight: '400px' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Powered by <a href="https://cloudflare.com/stream" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudflare Stream</a>
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-200 rounded-lg">
                      <p className="text-gray-600">Video content available</p>
                    </div>
                  )}
                  {article.bodyMarkdown && (
                    <TextArticleContent article={article} />
                  )}
                </div>
              ) : (
                <p>Content not available.</p>
              )}
            </div>
          ) : isSubscribers ? (
            // Subscribers-only content
            session?.user ? (
              // Check if user is subscribed
              (() => {
                const userSubscription = subscriptions.find(s => s.creatorId === creator.id)
                if (userSubscription && userSubscription.status === 'active') {
                  // User is subscribed - show content
                  return (
                    <div className="prose prose-lg max-w-none">
                      {/* Same content rendering logic as above */}
                      {article.contentType === 'text' ? (
                        // For text articles, prioritize publica.la content if available
                        article.pricing && 
                        typeof article.pricing === 'object' && 
                        'publica' in article.pricing && 
                        (article.pricing as any).publica?.readerUrl ? (
                          // Show publica.la embedded reader for complete content
                          <div className="w-full">
                            <div className="relative w-full" style={{ paddingBottom: '60%' }}>
                              <iframe
                                src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                                title={`${article.title} - Complete Article`}
                                className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                style={{ minHeight: '600px' }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Publica.la</a>
                            </p>
                          </div>
                        ) : (
                          // Fallback to bodyMarkdown if no publica.la content
                          article.bodyMarkdown ? (
                            <TextArticleContent article={article} />
                          ) : (
                            <p>Content not available.</p>
                          )
                        )
                      ) : article.contentType === 'audio' ? (
                        <div className="space-y-4">
                          {/* Audio Player */}
                          {article.pricing && 
                           typeof article.pricing === 'object' && 
                           'publica' in article.pricing && 
                           (article.pricing as any).publica?.readerUrl ? (
                            // Use Publica.la embedded audio player
                            <div className="w-full">
                              <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                                <iframe
                                  src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                                  title={`${article.title} - Audio Player`}
                                  className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                  frameBorder="0"
                                  allow="autoplay; encrypted-media"
                                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                  style={{ minHeight: '600px' }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Publica.la</a>
                              </p>
                            </div>
                          ) : article.audioUrl ? (
                            // Fallback to basic HTML audio player if no publica.la integration
                            <div className="w-full">
                              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                <div className="flex items-center gap-2 mb-4">
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                  </svg>
                                  <h3 className="text-lg font-medium text-gray-900">Audio Content</h3>
                                </div>
                                <audio
                                  src={article.audioUrl}
                                  controls
                                  className="w-full"
                                  preload="metadata"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                              <p className="text-gray-600">Audio content available</p>
                            </div>
                          )}
                          {/* Only show TextArticleContent for non-audio content types */}
                          {article.contentType !== 'audio' && article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : article.contentType === 'image' ? (
                        <div className="space-y-4">
                          <div className="text-center py-8 border border-gray-200 rounded-lg">
                            <p className="text-gray-600">Image content available</p>
                          </div>
                          {article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : article.contentType === 'video' ? (
                        <div className="space-y-4">
                          {/* Show Cloudflare Stream video if videoId is available */}
                          {article.videoId ? (
                            <div className="w-full">
                              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                  src={`https://cloudflarestream.com/${article.videoId}/iframe`}
                                  title={`${article.title} - Video Player`}
                                  className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                  frameBorder="0"
                                  allow="autoplay; encrypted-media"
                                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                  style={{ minHeight: '400px' }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Powered by <a href="https://cloudflare.com/stream" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudflare Stream</a>
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                              <p className="text-gray-600">Video content available</p>
                            </div>
                          )}
                          {article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : (
                        <p>Content not available.</p>
                      )}
                    </div>
                  )
                } else {
                  // User is not subscribed - show paywall
                  return (
                    <Paywall
                      creatorId={creator.id}
                      creatorName={creator.name}
                      creatorSlug={creator.slug}
                      articleTitle={article.title}
                      subscriptionPrice={(creator as any).subscriptionPrice || 1000}
                      subscriptionPriceId={(creator as any).subscriptionPriceId}
                      isSubscribed={false}
                    />
                  )
                }
              })()
            ) : (
              // Not logged in - show paywall
              (() => {
                const articlePriceForPaywall = article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing ? (article.pricing as any).USD * 100 : 500
                
                return (
                  <Paywall
                    articleId={article.id}
                    creatorId={creator.id}
                    creatorName={creator.name}
                    creatorSlug={creator.slug}
                    articleTitle={article.title}
                    articlePrice={articlePriceForPaywall}
                    subscriptionPrice={(creator as any).subscriptionPrice || 1000}
                    subscriptionPriceId={(creator as any).subscriptionPriceId}
                    isSubscribed={false}
                    hasPurchased={false}
                  />
                )
              })()
            )
          ) : (
            // Paid content
            session?.user ? (
              // Check if user has purchased or is subscribed
              (() => {
                const userSubscription = subscriptions.find(s => s.creatorId === creator.id)
                const userPurchase = purchases.find(p => p.articleId === article.id)
                
                if (userSubscription && userSubscription.status === 'active') {
                  // User is subscribed - show content
                  return (
                    <div className="prose prose-lg max-w-none">
                      {/* Same content rendering logic as above */}
                      {article.contentType === 'text' ? (
                        // For text articles, prioritize publica.la content if available
                        article.pricing && 
                        typeof article.pricing === 'object' && 
                        'publica' in article.pricing && 
                        (article.pricing as any).publica?.readerUrl ? (
                          // Show publica.la embedded reader for complete content
                          <div className="w-full">
                            <div className="relative w-full" style={{ paddingBottom: '60%' }}>
                              <iframe
                                src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                                title={`${article.title} - Complete Article`}
                                className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                style={{ minHeight: '600px' }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Publica.la</a>
                            </p>
                          </div>
                        ) : (
                          // Fallback to bodyMarkdown if no publica.la content
                          article.bodyMarkdown ? (
                            <TextArticleContent article={article} />
                          ) : (
                            <p>Content not available.</p>
                          )
                        )
                      ) : article.contentType === 'audio' ? (
                        <div className="space-y-4">
                          {/* Audio Player */}
                          {article.pricing && 
                           typeof article.pricing === 'object' && 
                           'publica' in article.pricing && 
                           (article.pricing as any).publica?.readerUrl ? (
                            // Use Publica.la embedded audio player
                            <div className="w-full">
                              <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                                <iframe
                                  src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                                  title={`${article.title} - Audio Player`}
                                  className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                  frameBorder="0"
                                  allow="autoplay; encrypted-media"
                                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                  style={{ minHeight: '600px' }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Publica.la</a>
                              </p>
                            </div>
                          ) : article.audioUrl ? (
                            // Fallback to basic HTML audio player if no publica.la integration
                            <div className="w-full">
                              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                <div className="flex items-center gap-2 mb-4">
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                  </svg>
                                  <h3 className="text-lg font-medium text-gray-900">Audio Content</h3>
                                </div>
                                <audio
                                  src={article.audioUrl}
                                  controls
                                  className="w-full"
                                  preload="metadata"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                              <p className="text-gray-600">Audio content available</p>
                            </div>
                          )}
                          {/* Only show TextArticleContent for non-audio content types */}
                          {article.contentType !== 'audio' && article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : article.contentType === 'image' ? (
                        <div className="space-y-4">
                          <div className="text-center py-8 border border-gray-200 rounded-lg">
                            <p className="text-gray-600">Image content available</p>
                          </div>
                          {article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : article.contentType === 'video' ? (
                        <div className="space-y-4">
                          {/* Show Cloudflare Stream video if videoId is available */}
                          {article.videoId ? (
                            <div className="w-full">
                              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                  src={`https://cloudflarestream.com/${article.videoId}/iframe`}
                                  title={`${article.title} - Video Player`}
                                  className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                  frameBorder="0"
                                  allow="autoplay; encrypted-media"
                                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                  style={{ minHeight: '400px' }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Powered by <a href="https://cloudflare.com/stream" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudflare Stream</a>
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                              <p className="text-gray-600">Video content available</p>
                            </div>
                          )}
                          {article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : (
                        <p>Content not available.</p>
                      )}
                    </div>
                  )
                } else if (userPurchase && userPurchase.status === 'active') {
                  // User has purchased - show content
                  return (
                    <div className="prose prose-lg max-w-none">
                      {/* Same content rendering logic as above */}
                      {article.contentType === 'text' ? (
                        // For text articles, prioritize publica.la content if available
                        article.pricing && 
                        typeof article.pricing === 'object' && 
                        'publica' in article.pricing && 
                        (article.pricing as any).publica?.readerUrl ? (
                          // Show publica.la embedded reader for complete content
                          <div className="w-full">
                            <div className="relative w-full" style={{ paddingBottom: '60%' }}>
                              <iframe
                                src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                                title={`${article.title} - Complete Article`}
                                className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                style={{ minHeight: '600px' }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Publica.la</a>
                            </p>
                          </div>
                        ) : (
                          // Fallback to bodyMarkdown if no publica.la content
                          article.bodyMarkdown ? (
                            <TextArticleContent article={article} />
                          ) : (
                            <p>Content not available.</p>
                          )
                        )
                      ) : article.contentType === 'audio' ? (
                        <div className="space-y-4">
                          {/* Audio Player */}
                          {article.pricing && 
                           typeof article.pricing === 'object' && 
                           'publica' in article.pricing && 
                           (article.pricing as any).publica?.readerUrl ? (
                            // Use Publica.la embedded audio player
                            <div className="w-full">
                              <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                                <iframe
                                  src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                                  title={`${article.title} - Audio Player`}
                                  className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                  frameBorder="0"
                                  allow="autoplay; encrypted-media"
                                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                  style={{ minHeight: '600px' }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Publica.la</a>
                              </p>
                            </div>
                          ) : article.audioUrl ? (
                            // Fallback to basic HTML audio player if no publica.la integration
                            <div className="w-full">
                              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                <div className="flex items-center gap-2 mb-4">
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                  </svg>
                                  <h3 className="text-lg font-medium text-gray-900">Audio Content</h3>
                                </div>
                                <audio
                                  src={article.audioUrl}
                                  controls
                                  className="w-full"
                                  preload="metadata"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                              <p className="text-gray-600">Audio content available</p>
                            </div>
                          )}
                          {/* Only show TextArticleContent for non-audio content types */}
                          {article.contentType !== 'audio' && article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : article.contentType === 'image' ? (
                        <div className="space-y-4">
                          <div className="text-center py-8 border border-gray-200 rounded-lg">
                            <p className="text-gray-600">Image content available</p>
                          </div>
                          {article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : article.contentType === 'video' ? (
                        <div className="space-y-4">
                          {/* Show Cloudflare Stream video if videoId is available */}
                          {article.videoId ? (
                            <div className="w-full">
                              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                  src={`https://cloudflarestream.com/${article.videoId}/iframe`}
                                  title={`${article.title} - Video Player`}
                                  className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                                  frameBorder="0"
                                  allow="autoplay; encrypted-media"
                                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                  style={{ minHeight: '400px' }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Powered by <a href="https://cloudflare.com/stream" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudflare Stream</a>
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                              <p className="text-gray-600">Video content available</p>
                            </div>
                          )}
                          {article.bodyMarkdown && (
                            <TextArticleContent article={article} />
                          )}
                        </div>
                      ) : (
                        <p>Content not available.</p>
                      )}
                    </div>
                  )
                } else {
                  // User has not purchased - show paywall
                  const articlePriceForPaywall = article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing ? (article.pricing as any).USD * 100 : 500
                  
                  return (
                    <Paywall
                      articleId={article.id}
                      creatorId={creator.id}
                      creatorName={creator.name}
                      creatorSlug={creator.slug}
                      articleTitle={article.title}
                      articlePrice={articlePriceForPaywall}
                      subscriptionPrice={(creator as any).subscriptionPrice || 1000}
                      subscriptionPriceId={(creator as any).subscriptionPriceId}
                      isSubscribed={false}
                      hasPurchased={false}
                    />
                  )
                }
              })()
            ) : (
              // Not logged in - show paywall
              (() => {
                const articlePriceForPaywall = article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing ? (article.pricing as any).USD * 100 : 500
                
                return (
                  <Paywall
                    articleId={article.id}
                    creatorId={creator.id}
                    creatorName={creator.name}
                    creatorSlug={creator.slug}
                    articleTitle={article.title}
                    articlePrice={articlePriceForPaywall}
                    subscriptionPrice={(creator as any).subscriptionPrice || 1000}
                    subscriptionPriceId={(creator as any).subscriptionPriceId}
                    isSubscribed={false}
                    hasPurchased={false}
                  />
                )
              })()
            )
          )}

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              Published on <span className="font-medium text-blue-600">publica.now</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Professional publishing infrastructure for independent creators
            </p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading content page:', error)
    throw new Error('Failed to load content page')
  }
}
