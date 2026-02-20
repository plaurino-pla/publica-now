'use client'

import { useSession } from 'next-auth/react'
import ArticleInteractions from './article-interactions'
import ArticleComments from './article-comments'

interface ArticleInteractionsWrapperProps {
  articleId: string
  creatorSlug: string
  creatorId: string
  initialLiked: boolean
  initialLikesCount: number
  initialSubscribed: boolean
  initialSubscribersCount: number
  initialSaved: boolean
  isFree: boolean
  isSubscribers: boolean
  isPaid: boolean
}

export default function ArticleInteractionsWrapper(props: ArticleInteractionsWrapperProps) {
  const { data: session, status } = useSession()

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <div className="flex justify-center mb-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <ArticleInteractions {...props} />
      <ArticleComments articleId={props.articleId} />
    </>
  )
}
