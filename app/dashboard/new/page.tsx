'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Eye, EyeOff, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon, Image, Mic, Video, FileText } from 'lucide-react'

export default function NewPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contentType = searchParams.get('type') || 'text'
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [visibility, setVisibility] = useState<'free' | 'paid' | 'subscribers'>('free')
  const [priceUSD, setPriceUSD] = useState('9.99')
  const [showSettings, setShowSettings] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const contentTypes = {
    text: { label: 'Text post', icon: FileText, placeholder: 'Start writing your post...' },
    audio: { label: 'Audio post', icon: Mic, placeholder: 'Add audio description or transcript...' },
    image: { label: 'Image post', icon: Image, placeholder: 'Describe your image or add context...' },
    video: { label: 'Video post', icon: Video, placeholder: 'Add video description or transcript...' }
  }

  const currentType = contentTypes[contentType as keyof typeof contentTypes] || contentTypes.text

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bodyMarkdown: content,
          coverUrl: coverUrl || null,
          visibility,
          pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : undefined,
          contentType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/dashboard/articles/${data.id}/edit`)
      } else {
        const error = await response.json()
        setMessage(`Failed to create post: ${error.message}`)
      }
    } catch (error) {
      setMessage('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertMarkdown = (markdown: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = content.substring(start, end)
      
      let insertText = markdown
      if (selectedText) {
        if (markdown === '**' || markdown === '*') {
          insertText = `${markdown}${selectedText}${markdown}`
        } else if (markdown === '# ' || markdown === '## ') {
          insertText = `${markdown}${selectedText}`
        } else if (markdown === '- ') {
          insertText = `${markdown}${selectedText}`
        }
      }
      
      const newContent = content.substring(0, start) + insertText + content.substring(end)
      setContent(newContent)
      
      // Set cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + insertText.length, start + insertText.length)
      }, 0)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <currentType.icon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-500">New {currentType.label}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                type="submit"
                form="post-form"
                disabled={isSubmitting || !title.trim()}
                size="sm"
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form id="post-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-0 outline-none resize-none"
              style={{ minHeight: 'auto' }}
            />
          </div>

          {/* Content Type Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <currentType.icon className="w-4 h-4" />
            <span>Creating a {currentType.label.toLowerCase()}</span>
          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('**')}
                className="h-8 w-8 p-0"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('*')}
                className="h-8 w-8 p-0"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('# ')}
                className="h-8 w-8 p-0"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('## ')}
                className="h-8 w-8 p-0"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('- ')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('[link text](url)')}
                className="h-8 w-8 p-0"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('![alt text](image-url)')}
                className="h-8 w-8 p-0"
              >
                <Image className="w-4 h-4" />
              </Button>
            </div>

            {/* Content Textarea */}
            <textarea
              id="content"
              placeholder={currentType.placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] text-lg text-gray-900 placeholder-gray-400 border-0 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Post settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as 'free' | 'paid' | 'subscribers')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="subscribers">Subscribers Only</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                
                {visibility === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="9.99"
                      value={priceUSD}
                      onChange={(e) => setPriceUSD(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
