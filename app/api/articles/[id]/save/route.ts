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

    // Check if user already saved this article using raw SQL
    const existingSaves = await prisma.$queryRaw`
      SELECT id FROM "readingListItems" 
      WHERE user_id = ${session.user.id} 
      AND article_id = ${articleId}
      LIMIT 1
    `

    const existingSave = (existingSaves as any[])[0]

    if (existingSave) {
      // Remove from reading list using raw SQL
      await prisma.$queryRaw`
        DELETE FROM "readingListItems" WHERE id = ${existingSave.id}
      `

      return NextResponse.json({ 
        message: 'Article removed from reading list',
        saved: false 
      })
    } else {
      // Add to reading list using raw SQL
      await prisma.$queryRaw`
        INSERT INTO "readingListItems" (user_id, article_id, "addedAt")
        VALUES (${session.user.id}, ${articleId}, NOW())
      `

      return NextResponse.json({ 
        message: 'Article added to reading list',
        saved: true 
      })
    }

  } catch (error) {
    console.error('Save article error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      userId: session?.user?.id,
      articleId: params.id
    })
    return NextResponse.json(
      { error: 'Failed to save/unsave article' },
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

    // Check if user saved this article using raw SQL
    const saves = await prisma.$queryRaw`
      SELECT id FROM "readingListItems" 
      WHERE user_id = ${session.user.id} 
      AND article_id = ${articleId}
      LIMIT 1
    `

    const save = (saves as any[])[0]

    // Get total saves count using raw SQL
    const savesCountResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "readingListItems" WHERE article_id = ${articleId}
    `

    const savesCount = Number((savesCountResult as any[])[0]?.count || 0)

    return NextResponse.json({
      saved: !!save,
      savesCount
    })

  } catch (error) {
    console.error('Get save status error:', error)
    return NextResponse.json(
      { error: 'Failed to get save status' },
      { status: 500 }
    )
  }
}
