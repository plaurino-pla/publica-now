import { NextRequest, NextResponse } from 'next/server'
import { PublicaClient } from '@/lib/publica'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Get configuration
    const globalApiToken = process.env.PUBLICA_API_TOKEN || 'api-b058d4d5-26c5-41ac-8f41-ed0bfe5fa696'
    const globalStoreDomain = process.env.PUBLICA_STORE_DOMAIN || 'plaurino.publica.la'

    if (!globalApiToken || !globalStoreDomain) {
      return NextResponse.json({ 
        error: 'Publica.la configuration not found',
        config: { apiToken: !!globalApiToken, storeDomain: !!globalStoreDomain }
      }, { status: 500 })
    }

    const publica = new PublicaClient(globalStoreDomain, globalApiToken)

    // Test content creation with sample data
    const testData = {
      name: 'Test Audio Content',
      publication_date: new Date().toISOString().slice(0, 10),
      extension: 'mp3',
      file_url: 'https://example.com/test-audio.mp3',
      external_id: `test-audio-${Date.now()}`,
      prices: { USD: 9.99 },
      description: 'Test audio content for debugging',
      lang: 'en',
      author: ['Test Creator'],
      keyword: ['test', 'audio', 'debug'],
    }

    try {
      const contentResponse = await publica.createContent(testData)

      return NextResponse.json({ 
        success: true, 
        message: 'Publica.la content creation successful',
        testData: testData,
        response: contentResponse
      })
    } catch (apiError) {
      console.error('Content creation test failed:', apiError)
      return NextResponse.json({ 
        error: 'Publica.la content creation test failed',
        testData: testData,
        config: {
          apiToken: '***' + globalApiToken.slice(-4),
          storeDomain: globalStoreDomain,
          fullUrl: `https://${globalStoreDomain}`
        },
        apiError: {
          message: apiError instanceof Error ? apiError.message : 'Unknown error',
          name: apiError instanceof Error ? apiError.name : 'Unknown',
          stack: apiError instanceof Error ? apiError.stack : undefined
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error testing publica.la content creation:', error)
    return NextResponse.json({ 
      error: 'Failed to test publica.la content creation', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
