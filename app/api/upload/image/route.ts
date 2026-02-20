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

    const formData = await req.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image file.' }, { status: 400 })
    }

    // Validate file size (4MB limit to avoid Vercel 413 on serverless body size)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Please upload images up to 4MB.' }, { status: 400 })
    }

    // Validate file name exists
    if (!file.name || typeof file.name !== 'string') {
      console.log('Image upload: Invalid file name:', file.name)
      return NextResponse.json({ error: 'Invalid file name. Please try uploading again.' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = `images/${session.user.id}/${timestamp}.${fileExtension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({ 
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload image. Please try again.' 
    }, { status: 500 })
  }
}
