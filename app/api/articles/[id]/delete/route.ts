import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const articleId = params.id

    // Check if user has permission to delete this article using raw SQL
    const memberships = await prisma.$queryRaw`
      SELECT m."creatorId", c.id as "creatorId"
      FROM memberships m
      JOIN creators c ON m."creatorId" = c.id
      WHERE m."userId" = ${session.user.id} 
      AND m.role = 'owner'
      LIMIT 1
    `

    const membership = (memberships as any[])[0]

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if article exists and belongs to the user's creator account using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT id FROM articles 
      WHERE id = ${articleId}
      AND "creatorId" = ${membership.creatorId}
      LIMIT 1
    `

    const article = (articles as any[])[0]

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Delete the article using raw SQL (this will cascade to related artifacts)
    await prisma.$queryRaw`
      DELETE FROM articles WHERE id = ${articleId}
    `

    return NextResponse.json({ message: 'Article deleted successfully' })

  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
