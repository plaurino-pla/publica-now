'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Bookmark, MessageCircle, UserPlus } from 'lucide-react'
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

  console.log('ArticleInteractions component mounted with props:', {
    articleId,
    creatorSlug,
    initialLiked,
    initialLikesCount,
    initialSubscribed,
    initialSubscribersCount,
    initialSaved,
    session: !!session?.user
  })

  // Fetch initial interaction states
  useEffect(() => {
    console.log('useEffect triggered, session:', !!session?.user)
    if (session?.user) {
      fetchInteractionStates()
    }
  }, [session, articleId, creatorSlug])

  const fetchInteractionStates = async () => {
    console.log('Fetching interaction states for article:', articleId, 'and creator:', creatorSlug)
    try {
      // Fetch like status
      console.log('Fetching like status...')
      const likeResponse = await fetch(`/api/articles/${articleId}/like`)
      console.log('Like response status:', likeResponse.status)
      if (likeResponse.ok) {
        const likeData = await likeResponse.json()
        console.log('Like data received:', likeData)
        setLiked(likeData.liked)
        setLikesCount(likeData.likesCount)
      } else {
        console.error('Failed to fetch like status:', likeResponse.status)
      }

      // Fetch subscription status
      console.log('Fetching subscription status...')
      const subResponse = await fetch(`/api/creators/${creatorSlug}/subscribe`)
      console.log('Subscription response status:', subResponse.status)
      if (subResponse.ok) {
        const subData = await subResponse.json()
        console.log('Subscription data received:', subData)
        setSubscribed(subData.subscribed)
        setSubscribersCount(subData.subscribersCount)
      } else {
        console.error('Failed to fetch subscription status:', subResponse.status)
      }

      // Fetch save status
      console.log('Fetching save status...')
      const saveResponse = await fetch(`/api/articles/${articleId}/save`)
      console.log('Save response status:', saveResponse.status)
      if (saveResponse.ok) {
        const saveData = await saveResponse.json()
        console.log('Save data received:', saveData)
        setSaved(saveData.saved)
      } else {
        console.error('Failed to fetch save status:', saveResponse.status)
      }
    } catch (error) {
      console.error('Failed to fetch interaction states:', error)
    }
  }

  const handleLike = async () => {
    console.log('Like button clicked for article:', articleId)
    
    if (!session?.user) {
      console.log('No session, redirecting to sign in')
      // Redirect to sign in
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    try {
      console.log('Sending like request to:', `/api/articles/${articleId}/like`)
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST'
      })
      
      console.log('Like response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Like response data:', data)
        setLiked(data.liked)
        setLikesCount(data.likesCount)
      } else {
        const errorData = await response.json()
        console.error('Like request failed:', errorData)
        alert(`Failed to like article: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to like article:', error)
      alert('Failed to like article. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async () => {
    console.log('Subscribe button clicked for creator:', creatorSlug)
    
    if (!session?.user) {
      console.log('No session, redirecting to sign in')
      // Redirect to sign in
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    try {
      console.log('Sending subscribe request to Stripe checkout')
      const response = await fetch('/api/stripe/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      })
      
      console.log('Stripe checkout response status:', response.status)
      if (response.ok) {
        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      } else {
        const errorData = await response.json()
        console.error('Stripe checkout failed:', errorData)
        alert(`Failed to start checkout: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to start checkout:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    console.log('Save button clicked for article:', articleId)
    
    if (!session?.user) {
      console.log('No session, redirecting to sign in')
      // Redirect to sign in
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    try {
      console.log('Sending save request to:', `/api/articles/${articleId}/save`)
      const response = await fetch(`/api/articles/${articleId}/save`, {
        method: 'POST'
      })
      
      console.log('Save response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Save response data:', data)
        setSaved(data.saved)
      } else {
        const errorData = await response.json()
        console.error('Save request failed:', errorData)
        alert(`Failed to save article: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to save article:', error)
      alert('Failed to save article. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComment = () => {
    // Focus the comment input field instead of showing "coming soon"
    const commentInput = document.querySelector('[data-comment-input]') as HTMLTextAreaElement
    if (commentInput) {
      commentInput.focus()
      commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
    <div className="flex flex-wrap gap-3 justify-center mb-8">
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

      {/* Comment Button - Only show if comments are enabled */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleComment}
        className="hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Comment</span>
      </Button>

      {/* Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Check out this article',
              url: window.location.href
            })
          } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
          }
        }}
        className="hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </Button>
    </div>
  )
}
