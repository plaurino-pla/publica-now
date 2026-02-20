import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/dashboard/page-header'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import AuthGuard from '@/components/auth-guard'
import { ArrowLeft, Edit, Eye, Calendar, Tag, DollarSign, FileText } from 'lucide-react'

async function getArticle(articleId: string, userId: string) {
  try {
    // Get user's creator membership using raw SQL
    const memberships = await prisma.$queryRaw`
      SELECT "creatorId" FROM memberships 
      WHERE "userId" = ${userId} 
      AND role = 'owner'
      LIMIT 1
    `

    const membership = (memberships as any[])[0]
    if (!membership) return null

    // Get article using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a.slug, a."contentType", a.status, a.visibility, 
        a.tags, a.pricing, a."bodyMarkdown", a."coverUrl", a."createdAt", 
        a."publishedAt", a."currentArtifactId"
      FROM articles a
      WHERE a.id = ${articleId} AND a."creatorId" = ${membership.creatorId}
      LIMIT 1
    `

    const article = (articles as any[])[0]
    if (!article) return null

    // Process the article data to match expected format
    return {
      ...article,
      tags: Array.isArray(article.tags) ? article.tags : [],
      pricing: article.pricing || {},
      createdAt: new Date(article.createdAt),
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
      currentArtifact: article.currentArtifactId ? { 
        id: article.currentArtifactId,
        version: '1.0' // Default version since we don't have version in database
      } : null
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'ready': return 'bg-blue-100 text-blue-800'
    case 'publishing': return 'bg-yellow-100 text-yellow-800'
    case 'failed': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getVisibilityColor(visibility: string) {
  switch (visibility) {
    case 'free': return 'bg-green-100 text-green-800'
    case 'subscribers': return 'bg-blue-100 text-blue-800'
    case 'paid': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

async function ArticleEditPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const article = await getArticle(params.id, session.user.id)
  
  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Article details"
        actions={(
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/articles/${article.id}/edit`} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-black hover:bg-gray-800 text-white">
              <Link href={`/dashboard/articles/${article.id}/view`} className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Link>
            </Button>
          </div>
        )}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2">
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}</span>
                </div>
                {article.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Published {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(article.status)}`}>
                  {article.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVisibilityColor(article.visibility)}`}>
                  {article.visibility}
                </span>
                {article.currentArtifact && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Version {article.currentArtifact.version}
                  </span>
                )}
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex gap-2">
                    {Array.isArray(article.tags) && article.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cover Image */}
            {article.coverUrl && (
              <div className="mb-8">
                <img 
                  src={article.coverUrl} 
                  alt="Cover" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Content Preview */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Content Preview</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed break-words">
                    {(article.bodyMarkdown || '').substring(0, 200)}
                    {(article.bodyMarkdown || '').length > 200 && (
                      <span className="text-gray-400">...</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Publishing Info */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Publishing info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Visibility</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(article.visibility)}`}>
                      {article.visibility}
                    </span>
                  </div>
                  {article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">${(article.pricing as any).USD}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Timestamps</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {article.publishedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Published</span>
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  {article.currentArtifact && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Version</span>
                      <span className="text-sm font-medium">{article.currentArtifact.version}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <ArticleEditPage params={params} />
    </AuthGuard>
  )
}
