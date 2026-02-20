import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Create just one creator for testing using raw SQL
    const creatorResult = await prisma.$queryRaw`
      INSERT INTO creators (
        name, slug, "storeDomain", "encryptedPublicaApiToken", branding, "createdAt", "updatedAt"
      )
      VALUES (
        'Test Demo Creator', 'test-demo-creator', 'test-demo.publica.now', 'demo-token-test',
        ${JSON.stringify({
          description: 'A test creator to verify database connection.',
          mainColor: '#FF6B6B',
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
          headerImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'
        })},
        NOW(), NOW()
      )
      RETURNING id
    `

    const creator = (creatorResult as any[])[0]

    // Create a simple article for this creator using raw SQL
    const articleResult = await prisma.$queryRaw`
      INSERT INTO articles (
        title, slug, "bodyMarkdown", "contentType", visibility, status, "creatorId", "publishedAt", tags, "createdAt", "updatedAt"
      )
      VALUES (
        'Test Article', 'test-article', '# Test Article\n\nThis is a test article to verify the creator is working.',
        'text', 'free', 'published', ${creator.id}, NOW(), 'test,demo', NOW(), NOW()
      )
      RETURNING id
    `

    const article = (articleResult as any[])[0]

    // Verify the creator exists using raw SQL
    const verifyCreators = await prisma.$queryRaw`
      SELECT 
        c.id, c.name, c.slug, c.branding,
        COUNT(a.id) as "articleCount"
      FROM creators c
      LEFT JOIN articles a ON c.id = a."creatorId"
      WHERE c.slug = 'test-demo-creator'
      GROUP BY c.id, c.name, c.slug, c.branding
    `

    const verifyCreator = (verifyCreators as any[])[0]

    return NextResponse.json({
      success: true,
      message: 'Single demo creator created successfully',
      creator: {
        id: creator.id,
        name: 'Test Demo Creator',
        slug: 'test-demo-creator',
        articleCount: verifyCreator.articleCount
      },
      article: {
        id: article.id,
        title: 'Test Article',
        slug: 'test-article'
      }
    })

  } catch (error) {
    console.error('❌ Error creating demo creator:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create demo creator', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
