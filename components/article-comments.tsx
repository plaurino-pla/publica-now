'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ArticleCommentsProps {
  articleId: string
}

export default function ArticleComments({ articleId }: ArticleCommentsProps) {
  const { data: session } = useSession()
  const [showComments, setShowComments] = useState(false)

  if (!session?.user) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#FAFAFA] mb-2">Join the conversation</h3>
        <p className="text-white/50 mb-4">Sign in to leave a comment and engage with other readers.</p>
        <Button asChild>
          <a href="/auth/signin">Sign In to Comment</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#FAFAFA] flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? 'Hide' : 'Show'} Comments
        </Button>
      </div>

      {showComments && (
        <div className="text-center py-8 text-white/40">
          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="mb-1">Comments are coming soon.</p>
          <p className="text-sm text-white/30">We're building a thoughtful discussion space for readers and creators.</p>
        </div>
      )}
    </div>
  )
}
