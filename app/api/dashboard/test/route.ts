import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Dashboard Test API: Starting request')
    
    const session = await getServerSession(authOptions)
    console.log('Dashboard Test API: Session check result:', !!session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('Dashboard Test API: User ID:', userId)

    // Return minimal data to test if basic functionality works
    return NextResponse.json({
      success: true,
      userId: userId,
      message: 'Dashboard test endpoint working'
    })

  } catch (error) {
    console.error('Dashboard Test API: Error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
