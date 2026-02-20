'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Image as ImageIcon, Upload, X, Plus } from 'lucide-react'

export default function ImagePostForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [visibility, setVisibility] = useState<'free' | 'paid' | 'subscribers'>('free')
  const [priceUSD, setPriceUSD] = useState('9.99')
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function compressImage(file: File, maxDim = 2000, quality = 0.85): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const scale = Math.min(1, maxDim / Math.max(width, height))
        width = Math.round(width * scale)
        height = Math.round(height * scale)
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file)
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
          resolve(compressed)
        }, 'image/jpeg', quality)
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (images.length + files.length > 5) {
      setMessage('You can only upload up to 5 images')
      return
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setMessage('Please select only image files')
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setMessage('Each image must be less than 10MB')
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setImages(prev => [...prev, ...validFiles])
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      setImageUrls(prev => [...prev, url])
    })

    setMessage('')
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index)
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index])
      return newUrls
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setMessage('Please fill in all required fields')
      return
    }
    if (images.length === 0) {
      setMessage('Please upload at least one image')
      return
    }

    setIsSubmitting(true)
    setMessage('Creating image post...')

    try {
      // Upload images first
      const uploadedUrls: string[] = []
      
      for (const image of images) {
        const formData = new FormData()
        const processed = image.size > 3.5 * 1024 * 1024 ? await compressImage(image) : image
        formData.append('image', processed)
        
        const uploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }
        
        const uploadData = await uploadResponse.json()
        uploadedUrls.push(uploadData.url)
      }

      // Create the article
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bodyMarkdown: description,
          coverUrl: coverUrl || null,
          tags: [],
          visibility,
          pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : null,
          contentType: 'image',
          imageUrls: uploadedUrls,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage('📤 Sending to publica.la...')
        // Immediately send compiled images to publica.la (server will build the PDF)
        try {
          const publicaRes = await fetch('/api/articles/image/publica', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: data.id,
              title,
              description,
              visibility,
              pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : undefined,
            })
          })
          if (publicaRes.ok) {
            setMessage('🎉 Image post created and sent to publica.la successfully!')
            setTimeout(() => router.push('/dashboard/articles'), 2000)
          } else {
            const err = await publicaRes.json().catch(() => ({}))
            setMessage(`✅ Image post created! ⚠️ Publica.la failed: ${err.error || 'Unknown error'}`)
            setTimeout(() => router.push(`/dashboard/articles/${data.id}/edit`), 3000)
          }
        } catch (e) {
          setMessage('✅ Image post created! ⚠️ Failed sending to publica.la, please retry from the editor')
          setTimeout(() => router.push(`/dashboard/articles/${data.id}/edit`), 3000)
        }
      } else {
        const error = await response.json()
        setMessage(`Failed to create image post: ${error.message}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="Create Image Post" subtitle="Share up to 5 images with your audience" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Title *
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title..."
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your images..."
                className="w-full p-3 border border-white/[0.08] rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Cover Image URL (optional)
              </label>
              <Input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://example.com/cover-image.jpg"
                className="w-full"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Images * (up to 5)
              </label>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500/100 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/[0.08] rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-white/30 mb-4" />
                  <p className="text-sm text-white/50 mb-2">
                    Click to upload images
                  </p>
                  <p className="text-xs text-white/40">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full p-3 border border-white/[0.08] rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="subscribers">Subscribers Only</option>
              </select>
            </div>

            {visibility === 'paid' && (
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Price (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </Card>

        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('🎉') 
              ? 'bg-emerald-500/10 text-green-800 border border-green-200' 
              : 'bg-red-500/10 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/articles')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Image Post'}
          </Button>
        </div>
      </form>
    </div>
  )
}
