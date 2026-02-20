import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import AuthGuard from '@/components/auth-guard'
import { ArrowLeft, Edit, Eye, Calendar, Tag, DollarSign, Globe, Play } from 'lucide-react'
import { marked } from 'marked'
import TextArticleContent from '@/components/text-article-content'

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

    // Get article with creator info using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a.slug, a."contentType", a.status, a.visibility, 
        a.tags, a.pricing, a."bodyMarkdown", a."coverUrl", a."createdAt", 
        a."publishedAt", a."currentArtifactId",
        c.slug as "creatorSlug", c.name as "creatorName"
      FROM articles a
      JOIN creators c ON a."creatorId" = c.id
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
      } : null,
      creator: {
        slug: article.creatorSlug,
        name: article.creatorName
      }
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'published': return 'bg-emerald-500/15 text-green-800'
    case 'draft': return 'bg-surface-2 text-[#FAFAFA]'
    case 'ready': return 'bg-brand-500/15 text-brand-800'
    case 'publishing': return 'bg-yellow-100 text-yellow-800'
    case 'failed': return 'bg-red-100 text-red-800'
    default: return 'bg-surface-2 text-[#FAFAFA]'
  }
}

function getVisibilityColor(visibility: string) {
  switch (visibility) {
    case 'free': return 'bg-emerald-500/15 text-green-800'
    case 'subscribers': return 'bg-brand-500/15 text-brand-800'
    case 'paid': return 'bg-purple-100 text-purple-800'
    default: return 'bg-surface-2 text-[#FAFAFA]'
  }
}

function renderContent(markdown: string) {
  return marked(markdown)
}

async function ArticleViewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const article = await getArticle(params.id, session.user.id)
  
  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="text-white/50 hover:text-[#FAFAFA]"
              >
                <Link href="/dashboard/articles">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to posts
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-sm text-white/40">Preview</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/articles/${article.id}/edit`} className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-black hover:bg-gray-800 text-white">
                <Link href={`/${article.creator.slug}/content/${article.slug}`} target="_blank" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View public page
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2">
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#FAFAFA] mb-4">{article.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
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
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-surface-2 text-[#FAFAFA]">
                    Version {article.currentArtifact.version}
                  </span>
                )}
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-white/30" />
                  <div className="flex gap-2">
                    {article.tags && typeof article.tags === 'string' && article.tags.split(',').map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-surface-2 text-white/60 text-sm rounded">
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

            {/* Audio Player for Audio Posts */}
            {article.contentType === 'audio' && article.audioUrl && (
              <div className="mb-8">
                <div className="border border-white/[0.06] rounded-lg p-6 bg-surface-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Play className="w-5 h-5 text-white/50" />
                    <h3 className="text-lg font-medium text-[#FAFAFA]">Audio Content</h3>
                  </div>
                  
                  {/* Check if we have publica.la reader URL for embedded player */}
                  {article.pricing && 
                   typeof article.pricing === 'object' && 
                   'publica' in article.pricing && 
                   (article.pricing as any).publica?.readerUrl ? (
                    // Use Publica.la embedded audio player
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
                      <p className="text-sm text-white/40 mt-2 text-center">
                        Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Publica.la</a>
                      </p>
                    </div>
                  ) : (
                    // Fallback to basic HTML audio player if no publica.la ID
                    <div className="w-full">
                      <audio
                        src={article.audioUrl}
                        controls
                        className="w-full"
                      />
                      <p className="text-sm text-white/40 mt-2 text-center">
                        Basic audio player - <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Upgrade to Publica.la</a> for enhanced features
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video Embed for Video Posts */}
            {article.contentType === 'video' && article.videoId && (
              <div className="mb-8">
                <div className="border border-white/[0.06] rounded-lg p-6 bg-surface-0">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-[#FAFAFA]">Video Content</h3>
                  </div>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${article.videoId}`}
                      title="YouTube video"
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Text Content for Text Articles */}
            {article.contentType === 'text' && (
              <TextArticleContent article={article} />
            )}

            {/* Image Reader for Image Posts via publica.la */}
            {article.contentType === 'image' && article.pricing && typeof article.pricing === 'object' && 'publica' in article.pricing && (article.pricing as any).publica?.readerUrl && (
              <div className="mb-8">
                <div className="border border-white/[0.06] rounded-lg p-6 bg-surface-0">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <h3 className="text-lg font-medium text-[#FAFAFA]">Image PDF</h3>
                  </div>
                  <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                    <iframe
                      src={`${(article.pricing as any).publica.readerUrl}?embedded=true`}
                      title={`${article.title} - PDF Reader`}
                      className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  </div>
                  <p className="text-sm text-white/40 mt-2 text-center">
                    Powered by <a href="https://plaurino.publica.la" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Publica.la</a>
                  </p>
                </div>
              </div>
            )}

            {/* Article Content */}
            {article.bodyMarkdown && article.bodyMarkdown.trim() && article.contentType !== 'text' && (
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-[#FAFAFA] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(article.bodyMarkdown) }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Publishing Info */}
              <div className="border border-white/[0.06] rounded-lg p-6">
                <h3 className="font-semibold text-[#FAFAFA] mb-4">Publishing info</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Visibility</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(article.visibility)}`}>
                      {article.visibility}
                    </span>
                  </div>
                  {article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Price</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-white/30" />
                        <span className="font-medium">${(article.pricing as any).USD}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Public URL */}
              <div className="border border-white/[0.06] rounded-lg p-6">
                <h3 className="font-semibold text-[#FAFAFA] mb-4">Public URL</h3>
                <div className="space-y-3">
                  <div className="bg-surface-0 p-3 rounded-lg border border-white/[0.06]">
                    <div className="font-mono text-xs text-white/50 break-all">
                      {`http://localhost:3000/${article.creator.slug}/content/${article.slug}`}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/${article.creator.slug}/content/${article.slug}`} target="_blank" className="flex items-center justify-center gap-2">
                      <Globe className="w-4 h-4" />
                      Open public page
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ArticleViewPageWrapper({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <ArticleViewPage params={params} />
    </AuthGuard>
  )
}
