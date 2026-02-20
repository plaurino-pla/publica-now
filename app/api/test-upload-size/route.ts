import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get('content-length')
    const sizeInMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0
    
    // Try to parse form data to see if it works
    let formData
    try {
      formData = await req.formData()
      const file = formData.get('file') as File
      
      return NextResponse.json({
        success: true,
        message: 'Upload size test successful',
        contentLength: contentLength || 'Not provided',
        sizeInMB: sizeInMB.toFixed(2) + 'MB',
        fileReceived: !!file,
        fileSize: file ? file.size : 'No file',
        configWorking: 'Yes - large uploads are supported'
      })
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: 'FormData parsing failed',
        contentLength: contentLength || 'Not provided',
        sizeInMB: sizeInMB.toFixed(2) + 'MB',
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        configWorking: 'No - large uploads are not supported'
      }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Test endpoint error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
