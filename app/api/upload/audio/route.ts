import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    console.log('Audio upload request started')
    
    // Log request details for debugging
    console.log('Audio upload: Request headers:', Object.fromEntries(req.headers.entries()))
    console.log('Audio upload: Request method:', req.method)
    console.log('Audio upload: Request URL:', req.url)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('Audio upload: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Audio upload: User authenticated:', session.user.id)

    // Check content length before processing
    const contentLength = req.headers.get('content-length')
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024)
      console.log('Audio upload: Request content length:', `${sizeInMB.toFixed(2)}MB`)
      
      if (sizeInMB > 150) {
        console.log('Audio upload: Request too large:', `${sizeInMB.toFixed(2)}MB`)
        return NextResponse.json({ 
          error: 'File too large. Maximum size is 150MB. Please compress your audio file or use a smaller file.',
          maxSize: '150MB',
          currentSize: `${sizeInMB.toFixed(2)}MB`
        }, { status: 413 })
      }
    } else {
      console.log('Audio upload: No content-length header found')
    }

    let formData
    try {
      formData = await req.formData()
      console.log('Audio upload: FormData parsed successfully')
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
      console.log('Audio upload: No audio file provided')
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log('Audio upload: File details:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      sizeInMB: (audioFile.size / (1024 * 1024)).toFixed(2)
    })

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      console.log('Audio upload: Invalid file type:', audioFile.type)
      return NextResponse.json({ error: 'Invalid file type. Please upload an audio file.' }, { status: 400 })
    }

    // Validate file size (150MB limit for audio)
    const maxSizeMB = 150
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (audioFile.size > maxSizeBytes) {
      console.log('Audio upload: File too large:', `${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`)
      return NextResponse.json({ 
        error: `File size must be less than ${maxSizeMB}MB. Current size: ${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`,
        maxSize: `${maxSizeMB}MB`,
        currentSize: `${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 400 })
    }

    // Validate file name exists
    if (!audioFile.name || typeof audioFile.name !== 'string') {
      console.log('Audio upload: Invalid file name:', audioFile.name)
      return NextResponse.json({ error: 'Invalid file name. Please try uploading again.' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = audioFile.name.split('.').pop() || 'mp3'
    const filename = `audio/${session.user.id}/${timestamp}.${fileExtension}`

    console.log('Audio upload: Uploading to Vercel Blob:', filename)

    // Upload to Vercel Blob
    const blob = await put(filename, audioFile, {
      access: 'public',
      addRandomSuffix: false,
    })

    console.log('Audio upload: Successfully uploaded to Blob:', blob.url)

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
