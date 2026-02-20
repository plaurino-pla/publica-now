import { NextRequest, NextResponse } from 'next/server'
import { PublicaClient } from '@/lib/publica'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Get configuration
    const globalApiToken = process.env.PUBLICA_API_TOKEN || 'api-b058d4d5-26c5-41ac-8f41-ed0bfe5fa696'
    const globalStoreDomain = process.env.PUBLICA_STORE_DOMAIN || 'plaurino.publica.la'

    console.log('Testing publica.la configuration:', {
      apiToken: globalApiToken ? '***' + globalApiToken.slice(-4) : 'NOT_SET',
      storeDomain: globalStoreDomain,
      fullUrl: `https://${globalStoreDomain}`
    })

    if (!globalApiToken || !globalStoreDomain) {
      return NextResponse.json({ 
        error: 'Publica.la configuration not found',
        config: { apiToken: !!globalApiToken, storeDomain: !!globalStoreDomain }
      }, { status: 500 })
    }

    const publica = new PublicaClient(globalStoreDomain, globalApiToken)

    // Test basic connection by trying to get content
    console.log('Testing publica.la API connection...')
    
    try {
      const contentResponse = await publica.getContent({ per_page: 1 })
      console.log('Publica API test successful:', contentResponse)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Publica.la API connection successful',
        config: {
          apiToken: '***' + globalApiToken.slice(-4),
          storeDomain: globalStoreDomain,
          fullUrl: `https://${globalStoreDomain}`,
          testResponse: {
            dataCount: contentResponse.data?.length || 0,
            hasData: !!contentResponse.data
          }
        }
      })
    } catch (apiError) {
      console.error('Publica API test failed:', apiError)
      return NextResponse.json({ 
        error: 'Publica.la API test failed',
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
    console.error('Error testing publica.la configuration:', error)
    return NextResponse.json({ 
      error: 'Failed to test publica.la configuration', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
