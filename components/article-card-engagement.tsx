'use client'

import { useState, useEffect } from 'react'
import { Heart, Bookmark, Share2, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ArticleCardEngagementProps {
  articleId: string
  initialLikesCount: number
  creatorSlug: string
  articleSlug: string
}

export default function ArticleCardEngagement({
  articleId,
  initialLikesCount,
  creatorSlug,
  articleSlug,
}: ArticleCardEngagementProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchStates()
    }
  }, [session, articleId])

  const fetchStates = async () => {
    try {
      const [likeRes, saveRes] = await Promise.all([
        fetch(`/api/articles/${articleId}/like`),
        fetch(`/api/articles/${articleId}/save`),
      ])

      if (likeRes.ok) {
        const data = await likeRes.json()
        setLiked(data.liked)
        setLikesCount(data.likesCount)
      }
      if (saveRes.ok) {
        const data = await saveRes.json()
        setSaved(data.saved)
      }
    } catch {
      // keep server-provided initial values
    }
  }

  const handleLike = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin'
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setLikesCount(data.likesCount)
      }
    } catch {
      // silent
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
      const res = await fetch(`/api/articles/${articleId}/save`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/${creatorSlug}/content/${articleSlug}`
    if (navigator.share) {
      navigator.share({ title: 'Check out this article', url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-4 text-sm text-white/40">
      <button
        aria-label="Like"
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded ${
          liked ? 'text-red-400' : 'hover:text-red-400'
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        <span>{likesCount}</span>
      </button>
      <button
        aria-label="Save"
        onClick={handleSave}
        disabled={isLoading}
        className={`flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded ${
          saved ? 'text-brand-400' : 'hover:text-white'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
      </button>
      <button
        aria-label="Share"
        onClick={handleShare}
        className="flex items-center gap-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
