'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Video, Play, ExternalLink, Upload, Youtube, CheckCircle, AlertCircle } from 'lucide-react'

export default function VideoPostForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [nativeUploadUid, setNativeUploadUid] = useState<string>('')
  const [nativeUploadUrl, setNativeUploadUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [visibility, setVisibility] = useState<'free' | 'subscribers' | 'paid'>('free')
  const [priceUSD, setPriceUSD] = useState('9.99')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [videoSource, setVideoSource] = useState<'youtube' | 'upload' | null>(null)

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeVideoId(youtubeUrl)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null

  const createArticle = async (payload: any) => {
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return response
  }

  const startDirectUpload = async () => {
    setIsUploading(true)
    setMessage('Requesting upload URL...')
    try {
      const res = await fetch('/api/video/stream/direct-upload', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create upload')
      setNativeUploadUid(json.uid)
      setNativeUploadUrl(json.uploadURL)
      setMessage('Upload URL ready. Select an MP4 to upload directly.')
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const uploadFileToStream = async (file: File) => {
    if (!nativeUploadUrl) {
      setMessage('Upload URL not ready')
      return false
    }
    if (file.size > 200 * 1024 * 1024) {
      setMessage('File > 200MB. Use YouTube for now or we will add resumable uploads next.')
      return false
    }
    setIsUploading(true)
    setUploadProgress(0)
    setMessage('Uploading video to Cloudflare Stream...')
    
    try {
      const form = new FormData()
      form.append('file', file)
      
      // Simulate upload progress (since we can't track real progress with FormData)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)
      
      const res = await fetch(nativeUploadUrl, { method: 'POST', body: form })
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      setMessage('✅ Upload complete! Video processing...')
      return true
    } catch (e: any) {
      setMessage(`❌ Upload error: ${e.message}`)
      return false
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!title.trim() || !description.trim()) {
      setMessage('❌ Please fill in title and description')
      return
    }

    if (!videoSource) {
      setMessage('❌ Please select a video source (YouTube or Upload)')
      return
    }

    if (videoSource === 'youtube' && (!youtubeUrl || !videoId)) {
      setMessage('❌ Please provide a valid YouTube URL')
      return
    }

    if (videoSource === 'upload' && !nativeUploadUid) {
      setMessage('❌ Please upload a video file first')
      return
    }

    setIsSubmitting(true)
    setMessage('Creating video post...')

    try {
      let response: Response
      if (videoSource === 'youtube' && youtubeUrl && videoId) {
        response = await createArticle({
          title,
          bodyMarkdown: description,
          coverUrl: coverUrl || null,
          tags: [],
          visibility,
          pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : null,
          contentType: 'video',
          videoUrl: youtubeUrl,
          videoId: videoId,
        })
      } else if (videoSource === 'upload' && nativeUploadUid) {
        response = await createArticle({
          title,
          bodyMarkdown: description,
          coverUrl: coverUrl || null,
          tags: [],
          visibility,
          pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : null,
          contentType: 'video',
          videoId: nativeUploadUid,
          videoUrl: `stream://${nativeUploadUid}`,
        })
      } else {
        setMessage('❌ Invalid video configuration')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setMessage('🎉 Video post created successfully!')
        setTimeout(() => {
          router.push('/dashboard/articles')
        }, 2000)
      } else {
        const error = await response.json()
        setMessage(`❌ Failed to create video post: ${error.message}`)
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper to check if form is ready to submit
  const canSubmit = () => {
    const hasBasicInfo = title.trim() && description.trim()
    const hasVideoSource = (videoSource === 'youtube' && youtubeUrl && videoId) || 
                          (videoSource === 'upload' && nativeUploadUid)
    return hasBasicInfo && hasVideoSource && !isSubmitting && !isUploading
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="Create Video Post" subtitle="Share your video content with your audience" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Title *
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your video title..."
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
                placeholder="Describe your video content..."
                className="w-full p-3 bg-surface-2 border border-white/[0.08] rounded-md text-white/90 placeholder:text-white/25 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
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

        {/* Video Source Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">Video Source</h3>
          <p className="text-sm text-white/50 mb-6">Choose how you want to add your video content</p>
          
          {/* Source Selection Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setVideoSource('youtube')
                setNativeUploadUid('')
                setNativeUploadUrl('')
              }}
              className={`p-6 border-2 rounded-lg transition-all ${
                videoSource === 'youtube'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-white/[0.06] hover:border-white/[0.08]'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <Youtube className={`w-8 h-8 mb-3 ${videoSource === 'youtube' ? 'text-red-500' : 'text-white/30'}`} />
                <h4 className="font-medium text-[#FAFAFA] mb-2">YouTube Video</h4>
                <p className="text-sm text-white/50">Link to an existing YouTube video</p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setVideoSource('upload')
                setYoutubeUrl('')
              }}
              className={`p-6 border-2 rounded-lg transition-all ${
                videoSource === 'upload'
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-white/[0.06] hover:border-white/[0.08]'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <Upload className={`w-8 h-8 mb-3 ${videoSource === 'upload' ? 'text-brand-500' : 'text-white/30'}`} />
                <h4 className="font-medium text-[#FAFAFA] mb-2">Upload Video</h4>
                <p className="text-sm text-white/50">Upload your own MP4 file (max 200MB)</p>
              </div>
            </button>
          </div>

          {/* YouTube URL Input */}
          {videoSource === 'youtube' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  YouTube Video URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(youtubeUrl, '_blank')}
                    disabled={!youtubeUrl}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
                {youtubeUrl && videoId && (
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-800">Valid YouTube URL detected</span>
                    </div>
                  </div>
                )}
                {youtubeUrl && !videoId && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-800">Invalid YouTube URL</span>
                    </div>
                  </div>
                )}
              </div>

              {embedUrl && (
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Video Preview
                  </label>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={embedUrl}
                      title="YouTube video preview"
                      className="absolute top-0 left-0 w-full h-full rounded-lg border"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video Upload - SIMPLIFIED APPROACH */}
          {videoSource === 'upload' && (
            <div className="space-y-6">
              {/* Always show this prominently */}
              <div className="text-center">
                <div className="border-2 border-dashed border-brand-300 rounded-lg p-8 bg-brand-500/10">
                  <Upload className="mx-auto h-16 w-16 text-brand-500 mb-4" />
                  <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">Upload Your Video</h3>
                  
                  {/* Step 1: Get Upload URL if needed */}
                  {!nativeUploadUrl && (
                    <div className="space-y-4">
                      <p className="text-white/50 mb-4">First, prepare the upload process</p>
                      <Button 
                        type="button" 
                        size="lg"
                        onClick={startDirectUpload} 
                        disabled={isUploading}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        {isUploading ? 'Preparing...' : 'Prepare Upload'}
                      </Button>
                    </div>
                  )}

                  {/* Step 2: File Selection - ALWAYS SHOW IF URL EXISTS */}
                  {nativeUploadUrl && (
                    <div className="space-y-4">
                      <p className="text-green-400 font-medium">✓ Upload ready! Now select your video file:</p>
                      <div className="bg-surface-0 border-2 border-white/[0.08] rounded-lg p-4">
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              console.log('File selected:', file.name, file.size)
                              const ok = await uploadFileToStream(file)
                              if (!ok) {
                                setNativeUploadUid('')
                                setNativeUploadUrl('')
                              }
                            }
                          }}
                          className="block w-full text-lg text-[#FAFAFA] bg-surface-0 border border-white/[0.08] rounded-lg p-4 cursor-pointer
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-lg file:border-0
                            file:text-lg file:font-semibold
                            file:bg-brand-600 file:text-white
                            hover:file:bg-brand-700"
                        />
                      </div>
                      <p className="text-sm text-white/50">Select an MP4 or WebM file (max 200MB)</p>
                      
                      {/* Debug what's preventing file input */}
                      <div className="text-xs bg-red-100 p-2 rounded">
                        <strong>File Input Debug:</strong><br/>
                        nativeUploadUrl: {nativeUploadUrl ? 'TRUE' : 'FALSE'}<br/>
                        nativeUploadUid: {nativeUploadUid ? 'TRUE' : 'FALSE'}<br/>
                        isUploading: {isUploading ? 'TRUE' : 'FALSE'}<br/>
                        Should show file input: {(nativeUploadUrl && !nativeUploadUid && !isUploading) ? 'YES' : 'NO'}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Upload Progress */}
                  {isUploading && (
                    <div className="space-y-4">
                      <p className="text-brand-400 font-medium">Uploading your video...</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-surface-2 rounded-full h-3">
                          <div 
                            className="bg-brand-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Success */}
                  {nativeUploadUid && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                        <h4 className="text-lg font-semibold text-green-800">Upload Successful!</h4>
                        <p className="text-green-400">Your video is ready. You can now publish your post.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNativeUploadUid('')
                          setNativeUploadUrl('')
                          setMessage('')
                          setUploadProgress(0)
                        }}
                        className="mt-4"
                      >
                        Upload Different Video
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Debug - always visible */}
              <div className="p-3 bg-amber-500/10 border border-yellow-200 rounded text-xs">
                <strong>Debug:</strong> URL: {nativeUploadUrl ? '✓' : '✗'} | UID: {nativeUploadUid ? '✓' : '✗'} | Uploading: {isUploading ? '✓' : '✗'}
              </div>
            </div>
          )}
        </Card>

        {/* Publishing Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">Publishing Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full p-3 bg-surface-2 border border-white/[0.08] rounded-md text-white/90 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="free">Free - Anyone can watch</option>
                <option value="subscribers">Subscribers Only</option>
                <option value="paid">Paid - One-time purchase</option>
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
                  placeholder="9.99"
                />
                <p className="text-xs text-white/40 mt-1">Price for one-time access or subscription requirement</p>
              </div>
            )}
          </div>
        </Card>

        {/* Status Messages */}
        {message && (
          <Card className="p-4">
            <div className={`flex items-center gap-2 ${
              message.includes('🎉') 
                ? 'text-green-800' 
                : message.includes('❌')
                ? 'text-red-800'
                : 'text-brand-800'
            }`}>
              {message.includes('🎉') && <CheckCircle className="w-5 h-5" />}
              {message.includes('❌') && <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{message}</span>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium text-[#FAFAFA]">Ready to publish?</h4>
              <p className="text-sm text-white/50 mt-1">
                {!canSubmit() 
                  ? 'Complete all required fields to publish your video post'
                  : 'Your video post is ready to be published'
                }
              </p>
            </div>
            <div className="flex gap-3">
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
                disabled={!canSubmit()}
                className={`${
                  canSubmit() 
                    ? 'bg-brand-600 hover:bg-brand-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                } flex items-center gap-2`}
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Video Post'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}
