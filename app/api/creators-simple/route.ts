import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock creators data to unblock frontend
    const mockCreators = [
      {
        id: '1',
        name: 'Demo Creator',
        slug: 'demo-creator',
        storeDomain: 'demo.publica.now',
        createdAt: new Date().toISOString(),
        totalArticles: 1,
        isNewCreator: false
      }
    ]

    return NextResponse.json({ 
      creators: mockCreators,
      version: '1.0.0-mock',
      timestamp: new Date().toISOString(),
      debug: {
        totalCreators: mockCreators.length,
        creatorsWithArticles: 1,
        creatorsWithoutArticles: 0,
        totalArticles: 1
      }
    })
  } catch (error) {
    console.error('Simple creators API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch creators', 
        details: error instanceof Error ? error.message : 'Unknown error',
        version: '1.0.0-mock-error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
