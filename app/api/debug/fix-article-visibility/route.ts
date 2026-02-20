import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin/owner
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, role: 'owner' }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('id')

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
    }

    const article = await prisma.article.findFirst({
      where: { id: articleId },
      include: { creator: true }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if user owns this article
    if (article.creatorId !== membership.creatorId) {
      return NextResponse.json({ error: 'Access denied to this article' }, { status: 403 })
    }

    const publicaData = article.pricing && typeof article.pricing === 'object' 
      ? (article.pricing as any).publica 
      : null

    return NextResponse.json({
      article: {
        id: article.id,
        title: article.title,
        contentType: article.contentType,
        visibility: article.visibility,
        status: article.status,
        createdAt: article.createdAt,
        publishedAt: article.publishedAt,
        pricing: article.pricing,
        publica: publicaData
      },
      analysis: {
        isFreeOnPublica: publicaData ? 'Unknown (check manually)' : 'Not sent to Publica.la',
        currentVisibility: article.visibility,
        shouldBeFree: true, // All content should be free on Publica.la
        needsFix: article.visibility !== 'free',
        publicaId: publicaData?.id || null,
        publicaExternalId: publicaData?.externalId || null,
        readerUrl: publicaData?.readerUrl || null
      },
      recommendations: [
        'All content is now forced to be free when sent to Publica.la',
        'Existing paid/subscribers articles on Publica.la cannot be updated via API',
        'To fix: Delete the article and re-create it, or contact Publica.la support',
        'Future articles will automatically be free on Publica.la',
        'Local visibility (free/paid/subscribers) is for organization only'
      ]
    })

  } catch (error) {
    console.error('Error analyzing article visibility:', error)
    return NextResponse.json(
      { error: 'Failed to analyze article', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
