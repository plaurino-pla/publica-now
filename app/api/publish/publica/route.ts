import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { z } from 'zod'

const publishSchema = z.object({
  articleId: z.string(),
  title: z.string(),
  bodyMarkdown: z.string(),
  coverUrl: z.string().nullable(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['free', 'paid', 'subscribers']),
  pricing: z.record(z.number()).nullable(),
})

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

    let body: any
    try {
      body = await req.json()
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const data = publishSchema.parse(body)

    // Verify the article belongs to this creator
    const article = await prisma.article.findFirst({
      where: {
        id: data.articleId,
        creatorId: membership.creatorId
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Use the correct publica.la API endpoint for content publishing
    const endpoint = '/webhooks/content-created'

    let publishResponse = null
    let lastError = null
    let successfulEndpoint = null

    try {
      // Format the request according to publica.la webhook documentation
      const requestBody = {
        articleId: article.id,
        title: data.title,
        contentType: 'audio',
        audioUrl: article.audioUrl,
        visibility: data.visibility,
        pricing: data.pricing,
        createdAt: article.createdAt,
        description: data.bodyMarkdown
      }

      publishResponse = await fetch(`${process.env.PUBLICA_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PUBLICA_API_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Tenant-URL': process.env.PUBLICA_TENANT_URL || '',
        },
        body: JSON.stringify(requestBody),
      })

      if (publishResponse.ok) {
        successfulEndpoint = endpoint
      } else {
        lastError = await publishResponse.text()
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error'
    }

    if (successfulEndpoint) {
      // Update article status to published
      await prisma.article.update({
        where: { id: article.id },
        data: {
          status: 'published',
          publishedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Successfully published to publica.la',
        endpoint: successfulEndpoint,
        articleId: article.id
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to publish to publica.la',
        error: lastError,
        fallback: 'Article saved locally, will retry later',
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json({
      error: 'Failed to publish to publica.la',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
