'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bold, Italic, Heading1, Heading2, List, Link, Image, Eye, EyeOff, Globe, Mic, Play, RefreshCcw } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'

interface Article {
  id: string
  title: string
  coverUrl: string | null
  bodyMarkdown: string
  tags: string | null
  visibility: 'free' | 'paid' | 'subscribers'
  pricing: any
  status: string
  contentType: 'text' | 'audio' | 'image' | 'video'
  audioUrl?: string | null
}

function ArticleEditor({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [title, setTitle] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [visibility, setVisibility] = useState<'free'|'paid'|'subscribers'>('paid')
  const [priceUSD, setPriceUSD] = useState('9.99')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/articles/${params.id}`)
        if (response.ok) {
          const articleData = await response.json()
          setArticle(articleData)
          setTitle(articleData.title)
          setCoverUrl(articleData.coverUrl || '')
          setBody(articleData.bodyMarkdown)
          setTags(articleData.tags || '')
          setVisibility(articleData.visibility)
          setPriceUSD(articleData.pricing?.USD?.toString() || '9.99')
        }
      } catch (err) {
        setError('Failed to load article')
      }
    }
    fetchArticle()
  }, [params.id])

  async function updateArticle() {
    setLoading(true)
    setError('')
    try {
      console.log('Updating article…')
      
      const response = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          coverUrl: coverUrl || null,
          bodyMarkdown: body,
          tags: tags && typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
          visibility,
          pricing: { USD: parseFloat(priceUSD) }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update article')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/articles')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update article')
    } finally {
      setLoading(false)
    }
  }

  async function resendToPublicaForImage() {
    if (!article || article.contentType !== 'image') return
    setResending(true)
    setError('')
    try {
      const response = await fetch('/api/articles/image/publica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          title,
          description: body,
          visibility,
          pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : undefined,
        })
      })
      const resJson = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(resJson.message || resJson.error || 'Failed to resend to publica.la')
      }
      setSuccess(true) // Changed from setPublishSuccess to setSuccess
      setTimeout(() => setSuccess(false), 4000)
    } catch (e: any) {
      setError(e.message || 'Failed to resend to publica.la')
    } finally {
      setResending(false)
    }
  }

  const insertMarkdown = (markdown: string) => {
    const textarea = document.getElementById('body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newText = before + markdown + after
      setBody(newText)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + markdown.length, start + markdown.length)
      }, 0)
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/dashboard/articles')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                {article?.contentType === 'audio' && <Mic className="w-4 h-4 text-gray-600" />}
                <span className="text-sm text-gray-500">
                  Edit {article?.contentType === 'audio' ? 'audio' : ''} post
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-600 hover:text-gray-900"
              >
                {showSettings ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="ml-2">Settings</span>
              </Button>
              
              <Button 
                onClick={updateArticle} 
                disabled={loading || success || !title || !body}
                size="sm"
                className="bg-black hover:bg-gray-800 text-white"
              >
                {loading ? 'Updating…' : success ? 'Updated! 🎉' : 'Update'}
              </Button>

              {article?.contentType === 'image' && (
                <Button
                  onClick={resendToPublicaForImage}
                  disabled={resending}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  {resending ? 'Resending…' : 'Resend to Publica.la'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <div className="lg:col-span-2">
            {/* Title Input */}
            <div className="mb-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-4xl font-bold border-none outline-none placeholder-gray-400 resize-none"
                disabled={loading || success}
              />
            </div>

            {/* Cover Image */}
            {coverUrl && (
              <div className="mb-8">
                <img 
                  src={coverUrl} 
                  alt="Cover" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Toolbar - Only show for text content */}
            {article?.contentType !== 'audio' && (
              <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => insertMarkdown('**Bold text**')}
                  disabled={loading || success}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => insertMarkdown('*Italic text*')}
                  disabled={loading || success}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => insertMarkdown('# Heading 1')}
                  disabled={loading || success}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => insertMarkdown('## Heading 2')}
                  disabled={loading || success}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Heading2 className="w-4 h-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => insertMarkdown('- List item')}
                  disabled={loading || success}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => insertMarkdown('[Link text](https://example.com)')}
                  disabled={loading || success}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Link className="w-4 h-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => insertMarkdown('![Alt text](https://example.com/image.jpg)')}
                  disabled={loading || success}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Image className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Content Editor */}
            {article?.contentType === 'audio' ? (
              <div className="space-y-6">
                {/* Audio Player */}
                {article.audioUrl && (
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <Play className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900">Audio Content</h3>
                    </div>
                    <audio
                      src={article.audioUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                )}
                
                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                  <textarea 
                    id="body"
                    className="w-full min-h-[200px] border border-gray-200 rounded-lg p-4 outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-lg leading-relaxed" 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Add a description, transcript, or notes about your audio content..."
                    disabled={loading || success}
                  />
                </div>
              </div>
            ) : (
              <textarea 
                id="body"
                className="w-full min-h-[500px] border-none outline-none resize-none text-lg leading-relaxed font-serif" 
                value={body} 
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tell your story..."
                disabled={loading || success}
              />
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Post Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      disabled={loading || success}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      disabled={loading || success}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Visibility</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-transparent" 
                      value={visibility} 
                      onChange={(e) => setVisibility(e.target.value as any)}
                      disabled={loading || success}
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                      <option value="subscribers">Subscribers Only</option>
                    </select>
                  </div>

                  {visibility === 'paid' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Price (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceUSD}
                        onChange={(e) => setPriceUSD(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                        disabled={loading || success}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg shadow-lg">
            🎉 Article updated successfully! Redirecting...
          </div>
        )}

        {/* Removed publishSuccess message */}
      </div>
    </div>
  )
}

export default function ArticleEditPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <ArticleEditor params={params} />
    </AuthGuard>
  )
}
