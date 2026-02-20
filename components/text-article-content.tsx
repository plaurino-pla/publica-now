'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

interface TextArticleContentProps {
  article: {
    title: string
    bodyMarkdown?: string | null
    pricing?: any
    contentType: string
    creatorId?: string
  }
  compact?: boolean
  creator?: any
  isFree?: boolean
  isPreview?: boolean
  isPaid?: boolean
  renderContent?: (content: string) => string
  locked?: boolean
}

function SubscribeAction({ creatorId }: { creatorId?: string }) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      })

      if (response.ok) {
        const { url } = await response.json()
        if (url) window.location.href = url
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to start checkout')
      }
    } catch {
      setError('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        size="lg"
        className="bg-brand-600 hover:bg-brand-700"
        onClick={handleSubscribe}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Subscribe'}
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </>
  )
}

export default function TextArticleContent({
  article,
  compact = false,
  locked = false,
  renderContent,
}: TextArticleContentProps) {
  const hasPublicaIntegration = article.pricing &&
    typeof article.pricing === 'object' &&
    'publica' in article.pricing &&
    (article.pricing as any).publica?.readerUrl

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-600">Text Article</span>
          </div>
        </div>

        {hasPublicaIntegration && !locked ? (
          <div className="w-full">
            <div className="relative w-full" style={{ paddingBottom: '60%' }}>
              <iframe
                src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                title={`${article.title} - Text Reader`}
                className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                style={{ minHeight: '400px' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Publica.la</a>
            </p>
          </div>
        ) : locked ? (
          <div className="w-full text-center py-6">
            <p className="text-sm text-gray-600 mb-3">This content is for subscribers only.</p>
            <div className="flex items-center justify-center gap-3">
              <SubscribeAction creatorId={article.creatorId} />
              <Button size="sm" variant="outline" asChild>
                <a href="/auth/signin">Sign in</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="text-sm text-gray-600 line-clamp-3">
              {(renderContent ? renderContent(article.bodyMarkdown || '') : (article.bodyMarkdown || '')).substring(0, 150)}...
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Basic preview - <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Upgrade to Publica.la</a> for enhanced reading
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
          </div>

        </div>

        {hasPublicaIntegration && !locked ? (
          <div className="w-full">
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              <iframe
                src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                title={`${article.title} - Text Reader`}
                className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                style={{ minHeight: '600px' }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Publica.la</a>
            </p>
          </div>
        ) : locked ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscribers Only</h3>
            <p className="text-gray-600 mb-6">Subscribe to access this content.</p>
            <div className="flex items-center justify-center gap-3">
              <SubscribeAction creatorId={article.creatorId} />
              <Button size="lg" variant="outline" asChild>
                <a href="/auth/signin">Sign in</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="prose prose-lg max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: renderContent ? renderContent(article.bodyMarkdown || '') : (article.bodyMarkdown || '') }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Basic text display - <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Upgrade to Publica.la</a> for enhanced reading experience
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
