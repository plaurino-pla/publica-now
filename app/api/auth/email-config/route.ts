import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Email is temporarily disabled to focus on basic authentication
    const isConfigured = false
    
    return NextResponse.json({
      configured: isConfigured,
      hasPostmark: !!process.env.POSTMARK_API_TOKEN,
      hasGenericSMTP: !!(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD),
      message: 'Email authentication is temporarily disabled while we fix basic authentication'
    })
  } catch (error) {
    console.error('Email config check error:', error)
    return NextResponse.json({ 
      configured: false,
      error: 'Failed to check email configuration'
    }, { status: 500 })
  }
}
