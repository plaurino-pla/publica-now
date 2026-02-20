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
    console.log('=== PUBLISH TO PUBLICA.LA DEBUG START ===')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ User authenticated:', session.user.id)

    const membership = await prisma.membership.findFirst({ 
      where: { userId: session.user.id, role: 'owner' } 
    })
    if (!membership) {
      console.log('❌ No creator membership found')
      return NextResponse.json({ error: 'No creator space' }, { status: 403 })
    }
    console.log('✅ Creator membership found:', membership.creatorId)

    let body: any
    try {
      body = await req.json()
      console.log('📝 Request body:', JSON.stringify(body, null, 2))
    } catch (error) {
      console.log('❌ Failed to parse request body:', error)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const data = publishSchema.parse(body)
    console.log('✅ Request data validated:', data)

    // Verify the article belongs to this creator
    const article = await prisma.article.findFirst({
      where: {
        id: data.articleId,
        creatorId: membership.creatorId
      }
    })

    if (!article) {
      console.log('❌ Article not found:', data.articleId)
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    console.log('✅ Article found:', article.id, article.title)



    // Check environment variables
    console.log('🔧 Environment check:')
    console.log('- PUBLICA_API_URL:', process.env.PUBLICA_API_URL ? '✅ Set' : '❌ Not set')
    console.log('- PUBLICA_API_TOKEN:', process.env.PUBLICA_API_TOKEN ? '✅ Set' : '❌ Not set')
    console.log('- PUBLICA_TENANT_URL:', process.env.PUBLICA_TENANT_URL ? '✅ Set' : '❌ Not set')

    // Use the correct publica.la API endpoint for content publishing
    const endpoint = '/webhooks/content-created'

    let publishResponse = null
    let lastError = null
    let successfulEndpoint = null

    try {
      console.log(`\n🔄 Publishing to publica.la endpoint: ${endpoint}`)
      
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
      
      console.log('📤 Request payload:', JSON.stringify(requestBody, null, 2))
      
      publishResponse = await fetch(`${process.env.PUBLICA_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PUBLICA_API_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Tenant-URL': process.env.PUBLICA_TENANT_URL || '',
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📊 Response status: ${publishResponse.status}`)
      console.log(`📊 Response headers:`, Object.fromEntries(publishResponse.headers.entries()))

      if (publishResponse.ok) {
        const responseData = await publishResponse.json()
        console.log(`✅ Successfully published to publica.la`)
        console.log('📥 Response data:', responseData)
        successfulEndpoint = endpoint
      } else {
        lastError = await publishResponse.text()
        console.log(`❌ Failed to publish:`, lastError)
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error'
      console.log(`💥 Error publishing:`, lastError)
    }

    if (successfulEndpoint) {
      console.log('🎉 Publishing successful! Updating article status...')
      
      // Update article status to published
      await prisma.article.update({
        where: { id: article.id },
        data: { 
          status: 'published',
          publishedAt: new Date()
        }
      })

      console.log('✅ Article status updated to published')
      console.log('=== PUBLISH TO PUBLICA.LA DEBUG END ===')

      return NextResponse.json({
        success: true,
        message: 'Successfully published to publica.la',
        endpoint: successfulEndpoint,
        articleId: article.id
      })
    } else {
      // If publishing failed, return error but don't fail completely
      console.log('❌ Publica.la publishing failed')
      console.log('📋 Summary of errors:', lastError)
      console.log('=== PUBLISH TO PUBLICA.LA DEBUG END ===')
      
      return NextResponse.json({
        success: false,
        message: 'Failed to publish to publica.la',
        error: lastError,
        fallback: 'Article saved locally, will retry later',
        debug: {
          endpoint_tried: endpoint,
          last_error: lastError,
          environment_vars: {
            api_url_set: !!process.env.PUBLICA_API_URL,
            token_set: !!process.env.PUBLICA_API_TOKEN,
            tenant_set: !!process.env.PUBLICA_TENANT_URL
          }
        }
      }, { status: 503 }) // Service Unavailable
    }

  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json({ 
      error: 'Failed to publish to publica.la',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
