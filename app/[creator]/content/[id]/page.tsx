'use server'

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
  } catch {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }
}

// Extracted content renderer — eliminates 4x duplication
function ContentRenderer({ article }: { article: any }) {
  if (article.contentType === 'text') {
    if (
      article.pricing &&
      typeof article.pricing === 'object' &&
      'publica' in article.pricing &&
      (article.pricing as any).publica?.readerUrl
    ) {
      return (
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
          <p className="text-xs text-white/40 mt-2 text-center">
            Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Publica.la</a>
          </p>
        </div>
      )
    }
    if (article.bodyMarkdown) {
      return <TextArticleContent article={article} />
    }
    return <p>Content not available.</p>
  }

  if (article.contentType === 'audio') {
    return (
      <div className="space-y-4">
        {article.pricing &&
         typeof article.pricing === 'object' &&
         'publica' in article.pricing &&
         (article.pricing as any).publica?.readerUrl ? (
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
            <p className="text-xs text-white/40 mt-2 text-center">
              Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Publica.la</a>
            </p>
          </div>
        ) : article.audioUrl ? (
          <div className="w-full">
            <div className="border border-white/[0.06] rounded-lg p-6 bg-surface-1">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                <h3 className="text-lg font-medium text-[#FAFAFA]">Audio Content</h3>
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
          <div className="text-center py-8 border border-white/[0.06] rounded-lg">
            <p className="text-white/50">Audio content available</p>
          </div>
        )}
      </div>
    )
  }

  if (article.contentType === 'image') {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 border border-white/[0.06] rounded-lg">
          <p className="text-white/50">Image content available</p>
        </div>
        {article.bodyMarkdown && <TextArticleContent article={article} />}
      </div>
    )
  }

  if (article.contentType === 'video') {
    return (
      <div className="space-y-4">
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
            <p className="text-xs text-white/40 mt-2 text-center">
              Powered by <a href="https://cloudflare.com/stream" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Cloudflare Stream</a>
            </p>
          </div>
        ) : (
          <div className="text-center py-8 border border-white/[0.06] rounded-lg">
            <p className="text-white/50">Video content available</p>
          </div>
        )}
        {article.bodyMarkdown && <TextArticleContent article={article} />}
      </div>
    )
  }

  return <p>Content not available.</p>
}

export default async function ContentPage({ params }: ContentPageProps) {
  try {
    const session = await getServerSession(authOptions)

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

    const isFree = article.visibility === 'free'
    const isSubscribers = article.visibility === 'subscribers'
    const isPaid = article.visibility === 'paid'

    // Get user's subscriptions and purchases for access control
    let subscriptions: any[] = []
    let purchases: any[] = []

    if (session?.user) {
      try {
        subscriptions = await prisma.$queryRaw`
          SELECT s.* FROM subscriptions s
          WHERE s.user_id = ${session.user.id}
        `

        purchases = await prisma.$queryRaw`
          SELECT p.* FROM purchases p
          WHERE p.user_id = ${session.user.id}
        `
      } catch {
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

        const saveData = await prisma.$queryRaw`
          SELECT CASE WHEN rl.id IS NOT NULL THEN true ELSE false END as saved
          FROM articles a
          LEFT JOIN "readingListItems" rl ON a.id = rl.article_id AND rl.user_id = ${session.user.id}
          WHERE a.id = ${article.id}
        `

        if ((saveData as any[]).length > 0) {
          initialSaved = (saveData as any[])[0].saved
        }
      } catch {
        // Continue with default values if there's an error
      }
    }

    // Determine if user has access to gated content
    const hasSubscription = subscriptions.some(
      s => s.creatorId === creator.id && s.status === 'active'
    )
    const hasPurchase = purchases.some(
      p => p.articleId === article.id && p.status === 'active'
    )
    const hasAccess = isFree || hasSubscription || (isPaid && hasPurchase)

    const articlePriceForPaywall = article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing
      ? (article.pricing as any).USD * 100
      : 500

    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Navigation */}
          <Link
            href={`/${creator.slug}`}
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {creator.name}
          </Link>

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
          {hasAccess ? (
            <div className="prose prose-lg max-w-none">
              <ContentRenderer article={article} />
            </div>
          ) : (
            <Paywall
              articleId={isPaid ? article.id : undefined}
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
          )}

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-white/[0.06]">
            <p className="text-white/50">
              Published on <span className="font-medium text-brand-400">publica.now</span>
            </p>
            <p className="text-sm text-white/40 mt-2">
              Professional publishing infrastructure for independent creators
            </p>
          </div>
        </div>
      </div>
    )
  } catch {
    throw new Error('Failed to load content page')
  }
}
