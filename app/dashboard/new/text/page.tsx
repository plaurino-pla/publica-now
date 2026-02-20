'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/dashboard/page-header'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Eye, EyeOff, Globe, Lock, DollarSign, Upload, Image as ImageIcon } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'
import RichTextEditor from '@/components/rich-text-editor'

export default function NewTextPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<'free' | 'paid' | 'subscribers'>('free')
  const [priceUSD, setPriceUSD] = useState('9.99')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [userHeaderImage, setUserHeaderImage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // Fetch user's header image on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.creator?.branding?.headerImage) {
            setUserHeaderImage(data.creator.branding.headerImage)
          }
        }
      } catch (error) {
        console.log('Could not fetch user header image, will use fallback')
      }
    }
    
    fetchUserProfile()
  }, [])

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCoverImage = () => {
    setCoverImage(null)
    setCoverPreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setMessage('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // First, create the article
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bodyMarkdown: content,
          tags: [],
          visibility,
          pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : undefined,
          contentType: 'text',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Immediately send to publica.la API
        try {
          setMessage('📤 Sending to publica.la...')
          
          // Always provide a cover image - use uploaded cover, user header image, or default fallback
          let coverImageToSend = null
          if (coverImage) {
            coverImageToSend = await fileToBase64(coverImage)
          } else if (userHeaderImage) {
            coverImageToSend = userHeaderImage
          } else {
            // Use default fallback cover image
            coverImageToSend = '/images/default-cover.svg'
          }
          
          const publicaResponse = await fetch('/api/articles/text/publica', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: data.id,
              title,
              description: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
              content,
              visibility,
              pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : undefined,
              coverImage: coverImageToSend,
              userHeaderImage,
            }),
          })

          if (publicaResponse.ok) {
            const publicaData = await publicaResponse.json()
            setMessage('🎉 Text article created and sent to publica.la successfully!')
            console.log('Publica.la response:', publicaData)
            setTimeout(() => {
              router.push('/dashboard/articles')
            }, 2000)
          } else {
            const publicaError = await publicaResponse.json()
            setMessage(`✅ Text article created! ⚠️ Publica.la failed: ${publicaError.error}`)
            setTimeout(() => {
              router.push(`/dashboard/articles/${data.id}/edit`)
            }, 3000)
          }
        } catch (publicaError) {
          console.error('Publica.la error:', publicaError)
          setMessage(`✅ Text article created! ⚠️ Publica.la failed: ${publicaError instanceof Error ? publicaError.message : 'Unknown error'}`)
          setTimeout(() => {
            router.push(`/dashboard/articles/${data.id}/edit`)
          }, 3000)
        }
      } else {
        const error = await response.json()
        setMessage(`Failed to create text article: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating text article:', error)
      setMessage('Failed to create text article. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  return (
    <div className="min-h-screen bg-surface-1">
      <PageHeader title="New Text Article" subtitle="Create a new text-based article" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Article Title
              </CardTitle>
              <CardDescription>
                Enter the title of your text article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter article title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
                required
              />
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Cover Image
              </CardTitle>
              <CardDescription>
                Upload a cover image for your EPUB. If none is provided, your account header image or a default cover will be used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverPreview ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-white/[0.06]"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-green-400">✓ Cover image uploaded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-white/[0.08] rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-white/50 mb-2">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-white/40">
                      Recommended: 800x1200px, JPG or PNG
                    </p>
                    <input
                      type="file"
                      id="coverImage"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('coverImage')?.click()}
                      className="mt-2"
                    >
                      Choose Image
                    </Button>
                  </div>
                  {userHeaderImage && (
                    <div className="text-sm text-white/50">
                      <p>📷 Fallback: Your account header image will be used if no cover is uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>
                Write your article with rich text formatting, images, and styling options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </CardContent>
          </Card>

          {/* Visibility and Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility & Pricing</CardTitle>
              <CardDescription>
                Choose how your article will be displayed and priced
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={visibility === 'free' ? 'default' : 'outline'}
                  onClick={() => setVisibility('free')}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Free
                </Button>
                <Button
                  type="button"
                  variant={visibility === 'paid' ? 'default' : 'outline'}
                  onClick={() => setVisibility('paid')}
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Paid
                </Button>
                <Button
                  type="button"
                  variant={visibility === 'subscribers' ? 'default' : 'outline'}
                  onClick={() => setVisibility('subscribers')}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Subscribers
                </Button>
              </div>

              {visibility === 'paid' && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-white/40" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="9.99"
                    value={priceUSD}
                    onChange={(e) => setPriceUSD(e.target.value)}
                    className="w-32"
                  />
                  <span className="text-sm text-white/50">USD</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? 'Creating...' : 'Create Text Article'}
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : message.includes('failed')
                ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                : 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
