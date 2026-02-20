'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Send, User } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Comment {
  id: string
  content: string
  author: {
    name: string
    email: string
  }
  createdAt: string
}

interface ArticleCommentsProps {
  articleId: string
  initialComments?: Comment[]
}

export default function ArticleComments({ articleId, initialComments = [] }: ArticleCommentsProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session?.user) return

    setIsSubmitting(true)
    try {
      // TODO: Implement comment submission API
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: {
          name: session.user.name || 'Anonymous',
          email: session.user.email || ''
        },
        createdAt: new Date().toISOString()
      }

      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch {
      // Comment submission failed silently — TODO: implement API
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Join the conversation</h3>
        <p className="text-gray-600 mb-4">Sign in to leave a comment and engage with other readers.</p>
        <Button asChild>
          <a href="/auth/signin">Sign In to Comment</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
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
        <>
          {/* Comment Form */}
          <div className="mb-6">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.author.name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
