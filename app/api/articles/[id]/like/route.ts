import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let session: any = null
  try {
    session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const articleId = params.id

    // Check if article exists using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT id FROM articles WHERE id = ${articleId}
    `

    if ((articles as any[]).length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if user already liked this article using raw SQL
    const existingLikes = await prisma.$queryRaw`
      SELECT id FROM likes 
      WHERE user_id = ${session.user.id} 
      AND article_id = ${articleId}
      LIMIT 1
    `

    const existingLike = (existingLikes as any[])[0]

    if (existingLike) {
      // Unlike the article using raw SQL
      await prisma.$queryRaw`
        DELETE FROM likes WHERE id = ${existingLike.id}
      `

      return NextResponse.json({ 
        message: 'Article unliked',
        liked: false 
      })
    } else {
      // Like the article using raw SQL
      await prisma.$queryRaw`
        INSERT INTO likes (user_id, article_id, "createdAt")
        VALUES (${session.user.id}, ${articleId}, NOW())
      `

      return NextResponse.json({ 
        message: 'Article liked',
        liked: true 
      })
    }

  } catch (error) {
    console.error('Like article error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      userId: session?.user?.id,
      articleId: params.id
    })
    return NextResponse.json(
      { error: 'Failed to like/unlike article' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const articleId = params.id

    // Check if user liked this article using raw SQL
    const likes = await prisma.$queryRaw`
      SELECT id FROM likes 
      WHERE user_id = ${session.user.id} 
      AND article_id = ${articleId}
      LIMIT 1
    `

    const like = (likes as any[])[0]

    // Get total likes count using raw SQL
    const likesCountResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM likes WHERE article_id = ${articleId}
    `

    const likesCount = Number((likesCountResult as any[])[0]?.count || 0)

    return NextResponse.json({
      liked: !!like,
      likesCount
    })

  } catch (error) {
    console.error('Get like status error:', error)
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    )
  }
}
