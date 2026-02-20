'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/dashboard/page-header'
import { ArrowLeft, Settings, Mic, MicOff, Upload, Play, Pause, Download, Trash2, FileAudio } from 'lucide-react'

export default function AudioPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [visibility, setVisibility] = useState<'free' | 'paid' | 'subscribers'>('free')
  const [priceUSD, setPriceUSD] = useState('9.99')
  const [showSettings, setShowSettings] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if browser supports audio recording
  const [isRecordingSupported, setIsRecordingSupported] = useState(false)

  useEffect(() => {
    setIsRecordingSupported(!!navigator.mediaDevices && !!window.MediaRecorder)
  }, [])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setMessage('')
    } catch (error) {
      console.error('Error starting recording:', error)
      setMessage('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (150MB limit)
      const maxSizeMB = 150
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      
      if (file.size > maxSizeBytes) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
        setMessage(`File too large: ${fileSizeMB}MB. Maximum size is ${maxSizeMB}MB. Please compress your audio file or use a smaller file.`)
        return
      }
      
      if (file.type.startsWith('audio/')) {
        setUploadedFile(file)
        setAudioBlob(file)
        setAudioUrl(URL.createObjectURL(file))
        setMessage('')
      } else {
        setMessage('Please select an audio file (MP3, WAV, etc.)')
      }
    }
  }

  const playAudio = () => {
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause()
      } else {
        audioElementRef.current.play()
      }
    }
  }

  const handleAudioPlay = () => setIsPlaying(true)
  const handleAudioPause = () => setIsPlaying(false)
  const handleAudioEnded = () => setIsPlaying(false)

  const clearAudio = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setUploadedFile(null)
    setRecordingTime(0)
    setIsPlaying(false)
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.currentTime = 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioBlob) {
      setMessage('Please record or upload an audio file')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // First, upload the audio file to Vercel Blob
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.webm')
      
      const uploadResponse = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        let errorMessage = 'Failed to upload audio file'
        
        try {
          const errorData = await uploadResponse.json()
          if (uploadResponse.status === 413) {
            errorMessage = `File too large: ${errorData.error || 'Maximum size exceeded'}. ${errorData.maxSize ? `Maximum size is ${errorData.maxSize}.` : ''} Please compress your audio file.`
          } else if (uploadResponse.status === 400) {
            errorMessage = `Upload error: ${errorData.error || 'Invalid file'}. ${errorData.suggestion || ''}`
          } else {
            errorMessage = `Upload failed: ${errorData.error || 'Unknown error'}`
          }
        } catch (parseError) {
          // If we can't parse the error response, provide a generic message based on status
          if (uploadResponse.status === 413) {
            errorMessage = 'File too large. Maximum size is 150MB. Please compress your audio file or use a smaller file.'
          } else if (uploadResponse.status === 400) {
            errorMessage = 'Invalid file format or corrupted file. Please try again.'
          } else if (uploadResponse.status >= 500) {
            errorMessage = 'Server error. Please try again later.'
          }
        }
        
        throw new Error(errorMessage)
      }

      const uploadData = await uploadResponse.json()
      const audioUrl = uploadData.url

      // Then create the article
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bodyMarkdown: description,
          coverUrl: coverUrl || null,
          tags: [],
          visibility,
          pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : undefined,
          contentType: 'audio',
          audioUrl,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Immediately send to publica.la API
        try {
          setMessage('📤 Sending to publica.la...')
          
          const publicaResponse = await fetch('/api/articles/audio/publica', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: data.id,
              title,
              description,
              audioUrl,
              visibility,
              pricing: visibility === 'paid' ? { USD: parseFloat(priceUSD) } : undefined,
            }),
          })

          if (publicaResponse.ok) {
            const publicaData = await publicaResponse.json()
            setMessage('🎉 Audio post created and sent to publica.la successfully!')
            console.log('Publica.la response:', publicaData)
            setTimeout(() => {
              router.push('/dashboard/articles')
            }, 2000)
          } else {
            const publicaError = await publicaResponse.json()
            setMessage(`✅ Audio post created! ⚠️ Publica.la failed: ${publicaError.error}`)
            setTimeout(() => {
              router.push(`/dashboard/articles/${data.id}/edit`)
            }, 3000)
          }
        } catch (publicaError) {
          console.error('Publica.la error:', publicaError)
          setMessage(`✅ Audio post created! ⚠️ Publica.la failed: ${publicaError instanceof Error ? publicaError.message : 'Unknown error'}`)
          setTimeout(() => {
            router.push(`/dashboard/articles/${data.id}/edit`)
          }, 3000)
        }
      } else {
        const error = await response.json()
        setMessage(`Failed to create audio post: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating audio post:', error)
      setMessage('Failed to create audio post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="New audio post"
        actions={(
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </Button>
            <Button 
              type="submit"
              form="audio-form"
              disabled={isSubmitting || !title.trim() || !audioBlob}
              size="sm"
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        )}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form id="audio-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Audio post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-0 outline-none resize-none"
              style={{ minHeight: 'auto' }}
            />
          </div>

          {/* Audio Recording/Upload Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Audio content</h2>
            
            {/* Recording Controls */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Record or upload audio</h3>
                {recordingTime > 0 && (
                  <span className="text-sm text-gray-600 font-mono">
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                {isRecordingSupported && (
                  <Button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Start Recording
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Audio
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {!isRecordingSupported && (
                <p className="text-sm text-gray-600 mb-4">
                  Audio recording is not supported in your browser. Please upload an audio file instead.
                </p>
              )}

              {/* File size information */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs">ℹ</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Audio file requirements:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Maximum file size: <strong>150MB</strong></li>
                      <li>• Supported formats: MP3, WAV, AAC, OGG, M4A</li>
                      <li>• For large files, consider compressing or using lower quality settings</li>
                    </ul>
                    <p className="text-xs text-blue-700 mt-2">
                      <strong>Note:</strong> If you encounter upload errors with large files, the new 150MB limit may still be propagating. Try again in a few minutes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {uploadedFile ? uploadedFile.name : 'Recorded audio'}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={clearAudio}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <audio
                    ref={audioElementRef}
                    src={audioUrl}
                    onPlay={handleAudioPlay}
                    onPause={handleAudioPause}
                    onEnded={handleAudioEnded}
                    className="w-full"
                    controls
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <textarea
              placeholder="Add a description, transcript, or notes about your audio content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[200px] text-lg text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg p-4 outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Post settings</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configure visibility, pricing, and cover image for your audio post
                </p>
              </div>
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
                    <option value="paid">Paid</option>
                    <option value="subscribers">Subscribers</option>
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
