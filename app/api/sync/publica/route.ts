import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const membership = await prisma.membership.findFirst({ 
      where: { userId: session.user.id, role: 'owner' } 
    })
    if (!membership) {
      return NextResponse.json({ error: 'No creator space' }, { status: 403 })
    }

    // Get all audio posts for this creator
    const audioPosts = await prisma.article.findMany({
      where: {
        creatorId: membership.creatorId,
        contentType: 'audio',
        audioUrl: { not: null }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (audioPosts.length === 0) {
      return NextResponse.json({ 
        message: 'No audio posts found to sync',
        synced: 0 
      })
    }

    let syncedCount = 0
    const results = []

    for (const post of audioPosts) {
      try {
        console.log(`Syncing audio post: ${post.title} (${post.id})`)
        
        // Try to send to publica.la
        const response = await fetch(`${process.env.PUBLICA_API_URL}/webhooks/content-created`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PUBLICA_API_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Tenant-URL': process.env.PUBLICA_TENANT_URL || '',
          },
          body: JSON.stringify({
            articleId: post.id,
            title: post.title,
            contentType: 'audio',
            audioUrl: post.audioUrl,
            visibility: post.visibility,
            pricing: post.pricing || null,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
          }),
        })

        if (response.ok) {
          syncedCount++
          results.push({
            id: post.id,
            title: post.title,
            status: 'success',
            message: 'Successfully synced to publica.la'
          })
          console.log(`Successfully synced: ${post.title}`)
        } else {
          const errorText = await response.text()
          results.push({
            id: post.id,
            title: post.title,
            status: 'error',
            message: `Failed to sync: ${errorText}`
          })
          console.error(`Failed to sync ${post.title}:`, errorText)
        }
      } catch (error) {
        results.push({
          id: post.id,
          title: post.title,
          status: 'error',
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
        console.error(`Error syncing ${post.title}:`, error)
      }
    }

    return NextResponse.json({
      message: `Synced ${syncedCount} out of ${audioPosts.length} audio posts`,
      synced: syncedCount,
      total: audioPosts.length,
      results
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ 
      error: 'Failed to sync with publica.la',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
