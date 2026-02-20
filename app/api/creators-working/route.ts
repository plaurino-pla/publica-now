import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Simply return empty array for now to unblock the frontend
    const mockCreators = [
      {
        id: 'demo-1',
        name: 'Demo Creator',
        slug: 'demo-creator',
        storeDomain: 'demo.publica.now',
        branding: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        articles: [],
        _count: { articles: 1 },
        contentTypeStats: { text: 1, audio: 0, image: 0, video: 0 },
        isNewCreator: false,
        totalArticles: 1
      }
    ]

    return NextResponse.json({ 
      creators: mockCreators,
      version: '1.0.0-working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Working creators API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch creators', 
        details: error instanceof Error ? error.message : 'Unknown error',
        version: '1.0.0-working-error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
