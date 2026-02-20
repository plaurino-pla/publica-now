import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check content length before processing
    const contentLength = req.headers.get('content-length')
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024)

      if (sizeInMB > 150) {
        return NextResponse.json({ 
          error: 'File too large. Maximum size is 150MB. Please compress your audio file or use a smaller file.',
          maxSize: '150MB',
          currentSize: `${sizeInMB.toFixed(2)}MB`
        }, { status: 413 })
      }
    }

    let formData
    try {
      formData = await req.formData()
    } catch (parseError) {
      console.error('Audio upload: FormData parsing failed:', parseError)
      
      // Check if it's a size-related error
      if (parseError instanceof Error) {
        if (parseError.message.includes('413') || parseError.message.includes('Payload Too Large')) {
          return NextResponse.json({ 
            error: 'File too large. Maximum size is 150MB. Please compress your audio file or use a smaller file.',
            maxSize: '150MB',
            suggestion: 'Try compressing your audio file or using a lower quality setting.',
            parseError: parseError.message
          }, { status: 413 })
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to parse upload data. The file may be too large or corrupted.',
        suggestion: 'Try uploading a smaller file or check if the file is corrupted.',
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      }, { status: 400 })
    }

    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an audio file.' }, { status: 400 })
    }

    // Validate file size (150MB limit for audio)
    const maxSizeMB = 150
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (audioFile.size > maxSizeBytes) {
      return NextResponse.json({ 
        error: `File size must be less than ${maxSizeMB}MB. Current size: ${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`,
        maxSize: `${maxSizeMB}MB`,
        currentSize: `${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 400 })
    }

    // Validate file name exists
    if (!audioFile.name || typeof audioFile.name !== 'string') {
      return NextResponse.json({ error: 'Invalid file name. Please try uploading again.' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = audioFile.name.split('.').pop() || 'mp3'
    const filename = `audio/${session.user.id}/${timestamp}.${fileExtension}`

    // Upload to Vercel Blob
    const blob = await put(filename, audioFile, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({ 
      url: blob.url,
      filename: filename,
      size: audioFile.size,
      type: audioFile.type,
      sizeInMB: (audioFile.size / (1024 * 1024)).toFixed(2)
    })

  } catch (error) {
    console.error('Audio upload error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Check if it's a size-related error
    if (error instanceof Error && error.message.includes('413')) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 150MB. Please compress your audio file or use a smaller file.',
        maxSize: '150MB',
        suggestion: 'Try compressing your audio file or using a lower quality setting.'
      }, { status: 413 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to upload audio. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
