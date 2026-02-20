import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Find article by ID
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, slug: true, contentType: true }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    console.log('Found article:', article)

    // Generate slug from title if missing
    if (!article.slug) {
      const newSlug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      console.log('Generated slug:', newSlug)

      // Update article with new slug
      const updatedArticle = await prisma.article.update({
        where: { id: params.id },
        data: { slug: newSlug },
        select: { id: true, title: true, slug: true, contentType: true }
      })

      console.log('Updated article:', updatedArticle)

      return NextResponse.json({
        success: true,
        message: 'Article slug fixed',
        article: updatedArticle
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Article already has a slug',
      article
    })

  } catch (error) {
    console.error('Error fixing article slug:', error)
    return NextResponse.json(
      { error: 'Failed to fix article slug', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
