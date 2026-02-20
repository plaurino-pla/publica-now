import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    console.log('=== PUBLICA.LA API TEST ===')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check environment variables
    const envCheck = {
      PUBLICA_API_URL: process.env.PUBLICA_API_URL || 'NOT_SET',
      PUBLICA_API_TOKEN: process.env.PUBLICA_API_TOKEN ? 'SET' : 'NOT_SET',
      PUBLICA_TENANT_URL: process.env.PUBLICA_TENANT_URL || 'NOT_SET'
    }

    console.log('Environment variables:', envCheck)

    if (!process.env.PUBLICA_API_URL || !process.env.PUBLICA_API_TOKEN) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        env: envCheck
      })
    }

    // Test basic connectivity to publica.la API
    const testEndpoints = [
      '/integration-api/v1/dashboard/issues',
      '/api/health',
      '/api/status',
      '/health',
      '/status'
    ]

    const results = []

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`)
        
        const response = await fetch(`${process.env.PUBLICA_API_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.PUBLICA_API_TOKEN}`,
            'X-Tenant-URL': process.env.PUBLICA_TENANT_URL || '',
          },
        })

        results.push({
          endpoint,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        })

        console.log(`✅ ${endpoint}: ${response.status}`)
      } catch (error) {
        results.push({
          endpoint,
          status: 'ERROR',
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.log(`❌ ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Publica.la API connectivity test completed',
      env: envCheck,
      results
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      status: 'error',
      error: 'Failed to test publica.la API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
