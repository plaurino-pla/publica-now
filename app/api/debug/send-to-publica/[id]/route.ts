import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PublicaClient } from '@/lib/publica'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const article = await prisma.article.findFirst({
      where: { id: params.id, contentType: 'audio' },
      include: { creator: { include: { memberships: { where: { userId: session.user.id, role: 'owner' } } } } }
    })

    if (!article || article.creator.memberships.length === 0) {
      return NextResponse.json({ error: 'Article not found or access denied' }, { status: 404 })
    }

    if (!article.audioUrl) {
      return NextResponse.json({ error: 'Article has no audio URL' }, { status: 400 })
    }

    const creator = article.creator

    // Use global publica.la configuration
    const globalApiToken = process.env.PUBLICA_API_TOKEN || 'api-b058d4d5-26c5-41ac-8f41-ed0bfe5fa696'
    const globalStoreDomain = process.env.PUBLICA_STORE_DOMAIN || 'plaurino.publica.la'

    if (!globalApiToken || !globalStoreDomain) {
      return NextResponse.json({ error: 'Publica.la configuration not found' }, { status: 500 })
    }

    const publica = new PublicaClient(globalStoreDomain, globalApiToken)
    const externalId = `audio-${article.id}-${Date.now()}`

    console.log('Manually sending audio to publica.la:', { 
      name: article.title, 
      external_id: externalId, 
      file_url: article.audioUrl, 
      description: (article.bodyMarkdown || '').substring(0, 200),
      storeDomain: globalStoreDomain
    })

    const publicaResponse = await publica.createContent({
      name: article.title,
      publication_date: new Date().toISOString().slice(0, 10),
      extension: 'mp3',
      file_url: article.audioUrl,
      external_id: externalId,
      prices: article.pricing && typeof article.pricing === 'object' && 'USD' in article.pricing 
        ? { USD: (article.pricing as any).USD } 
        : { USD: 9.99 },
      description: (article.bodyMarkdown || '').substring(0, 200),
      lang: 'en',
      author: [creator.name],
      keyword: ['audio', 'podcast', 'publica-now'],
    })

    console.log('Publica.la response:', publicaResponse)

    await prisma.article.update({
      where: { id: params.id },
      data: {
        pricing: {
          ...(article.pricing as any || {}),
          publica: {
            id: publicaResponse.id,
            externalId: publicaResponse.external_id,
            status: 'published',
            sentAt: new Date().toISOString()
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Audio sent to publica.la successfully', 
      publicaId: publicaResponse.id, 
      publicaExternalId: publicaResponse.external_id,
      articleId: params.id,
      debug: {
        originalPricing: article.pricing,
        newPricing: {
          ...(article.pricing as any || {}),
          publica: {
            id: publicaResponse.id,
            externalId: publicaResponse.external_id,
            status: 'published',
            sentAt: new Date().toISOString()
          }
        }
      }
    })

  } catch (error) {
    console.error('Error manually sending audio to publica.la:', error)
    return NextResponse.json({ 
      error: 'Failed to send audio to publica.la', 
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
