'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Bookmark, UserPlus, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ArticleInteractionsProps {
  articleId: string
  creatorSlug: string
  creatorId: string
  initialLiked?: boolean
  initialLikesCount?: number
  initialSubscribed?: boolean
  initialSubscribersCount?: number
  initialSaved?: boolean
  isFree: boolean
  isSubscribers: boolean
  isPaid: boolean
}

export default function ArticleInteractions({
  articleId,
  creatorSlug,
  creatorId,
  initialLiked = false,
  initialLikesCount = 0,
  initialSubscribed = false,
  initialSubscribersCount = 0,
  initialSaved = false,
  isFree,
  isSubscribers,
  isPaid
}: ArticleInteractionsProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [subscribed, setSubscribed] = useState(initialSubscribed)
  const [subscribersCount, setSubscribersCount] = useState(initialSubscribersCount)
  const [saved, setSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchInteractionStates()
    }
  }, [session, articleId, creatorSlug])

  // Auto-clear status messages
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  const fetchInteractionStates = async () => {
    try {
      const [likeResponse, subResponse, saveResponse] = await Promise.all([
        fetch(`/api/articles/${articleId}/like`),
        fetch(`/api/creators/${creatorSlug}/subscribe`),
        fetch(`/api/articles/${articleId}/save`),
      ])

      if (likeResponse.ok) {
        const likeData = await likeResponse.json()
        setLiked(likeData.liked)
        setLikesCount(likeData.likesCount)
      }

      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscribed(subData.subscribed)
        setSubscribersCount(subData.subscribersCount)
      }

      if (saveResponse.ok) {
        const saveData = await saveResponse.json()
        setSaved(saveData.saved)
      }
    } catch {
      // Silently fail — initial states from server are already set
    }
  }

  const handleLike = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikesCount(data.likesCount)
      } else {
        const errorData = await response.json()
        setStatusMessage(errorData.error || 'Failed to like article')
      }
    } catch {
      setStatusMessage('Failed to like article. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      })

      if (response.ok) {
        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      } else {
        const errorData = await response.json()
        setStatusMessage(errorData.error || 'Failed to start checkout')
      }
    } catch {
      setStatusMessage('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/articles/${articleId}/save`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setSaved(data.saved)
      } else {
        const errorData = await response.json()
        setStatusMessage(errorData.error || 'Failed to save article')
      }
    } catch {
      setStatusMessage('Failed to save article. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this article',
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!session?.user) {
    return (
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Sign in to interact with this content</p>
          <Link href="/auth/signin">
            <Button size="sm" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 mb-8">
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Like Button */}
        <Button
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          disabled={isLoading}
          className={`flex items-center gap-2 ${
            liked
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </Button>

        {/* Subscribe Button */}
        <Button
          variant={subscribed ? "default" : "outline"}
          size="sm"
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`flex items-center gap-2 ${
            subscribed
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'hover:bg-green-50 hover:text-green-600 hover:border-green-200'
          }`}
        >
          <UserPlus className={`w-4 h-4 ${subscribed ? 'fill-current' : ''}`} />
          <span>{subscribed ? 'Subscribed' : 'Subscribe'}</span>
        </Button>

        {/* Save Button */}
        <Button
          variant={saved ? "default" : "outline"}
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className={`flex items-center gap-2 ${
            saved
              ? 'bg-brand-500 hover:bg-brand-600 text-white'
              : 'hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </Button>

        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </Button>
      </div>

      {/* Status message */}
      {statusMessage && (
        <p className="text-sm text-red-600 text-center bg-red-50 py-2 px-3 rounded-md">
          {statusMessage}
        </p>
      )}
    </div>
  )
}
