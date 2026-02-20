'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Edit, Eye, Calendar, Tag, FileText, Mic, Image, Video, Trash2 } from 'lucide-react'
import { NewPostDropdown } from '@/components/new-post-dropdown'
import Badge from '@/components/ui/badge'
import Chip from '@/components/ui/chip'
import Skeleton from '@/components/ui/skeleton'
import { PageHeader } from '@/components/dashboard/page-header'

function getStatusColor(status: string) {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'ready': return 'bg-brand-100 text-brand-800'
    case 'publishing': return 'bg-yellow-100 text-yellow-800'
    case 'failed': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getVisibilityColor(visibility: string) {
  switch (visibility) {
    case 'free': return 'bg-green-100 text-green-800'
    case 'subscribers': return 'bg-brand-100 text-brand-800'
    case 'paid': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getContentTypeIcon(contentType: string) {
  switch (contentType) {
    case 'text': return FileText
    case 'audio': return Mic
    case 'image': return Image
    case 'video': return Video
    default: return FileText
  }
}

function getContentTypeLabel(contentType: string) {
  switch (contentType) {
    case 'text': return 'Text'
    case 'audio': return 'Audio'
    case 'image': return 'Image'
    case 'video': return 'Video'
    default: return 'Text'
  }
}

interface Article {
  id: string
  title: string
  slug: string
  contentType: string
  status: string
  visibility: string
  tags: string[]
  pricing: any
  createdAt: string
  publishedAt: string | null
  currentArtifact?: any
}

interface ArticlesClientProps {
  articles: Article[]
}

export default function ArticlesClient({ articles }: ArticlesClientProps) {
  const router = useRouter()
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return
    }

    setDeletingArticleId(articleId)
    setDeleteError('')

    try {
      const response = await fetch(`/api/articles/${articleId}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        setDeleteError(error.error || 'Failed to delete article')
      }
    } catch {
      setDeleteError('Failed to delete article. Please try again.')
    } finally {
      setDeletingArticleId(null)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader title="Posts" subtitle="Manage your published content" actions={<NewPostDropdown />} />

      {/* Delete Error */}
      {deleteError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">
            {deleteError}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {articles.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Edit className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No posts yet</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Start creating your first piece of content to build your audience
            </p>
            <NewPostDropdown size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article: Article) => (
              <div key={article.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {(() => {
                            const IconComponent = getContentTypeIcon(article.contentType || 'text')
                            return <IconComponent className="w-5 h-5 text-gray-600" />
                          })()}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status */}
                        {article.status === 'published' && <Badge variant="success">published</Badge>}
                        {article.status === 'ready' && <Badge variant="info">ready</Badge>}
                        {article.status === 'draft' && <Badge variant="outline">draft</Badge>}
                        {article.status === 'publishing' && <Badge variant="warning">publishing</Badge>}
                        {article.status === 'failed' && <Badge variant="danger">failed</Badge>}

                        {/* Visibility */}
                        {article.visibility === 'free' && <Badge variant="success">free</Badge>}
                        {article.visibility === 'subscribers' && <Badge variant="info">subscribers</Badge>}
                        {article.visibility === 'paid' && <Badge variant="info">paid</Badge>}

                        {/* Content type */}
                        <Chip variant="neutral" size="sm">
                          {getContentTypeLabel(article.contentType || 'text')}
                        </Chip>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Created {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}</span>
                      </div>
                      {article.publishedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Published {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                        </div>
                      )}
                      {article.currentArtifact && (
                        <span className="text-gray-500">Version {article.currentArtifact.version}</span>
                      )}
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <div className="flex gap-2">
                          {article.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline">#{tag.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {article.visibility === 'paid' && article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing && (
                      <div className="text-sm text-gray-600">
                        <Badge variant="warning">${(article.pricing as any).USD}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 ml-6">
                    <Button asChild variant="outline" size="sm" className="border-gray-300 hover:border-gray-400">
                      <Link aria-label={`Edit ${article.title}`} href={`/dashboard/articles/${article.id}/edit`} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-gray-300 hover:border-gray-400">
                      <Link aria-label={`View ${article.title}`} href={`/dashboard/articles/${article.id}/view`} className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingArticleId === article.id}
                      aria-label={`Delete ${article.title}`}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingArticleId === article.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
