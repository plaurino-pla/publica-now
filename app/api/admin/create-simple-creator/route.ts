import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Create a very basic creator with minimal fields
    const creator = await prisma.creator.upsert({
      where: { slug: 'demo-creator' },
      update: {},
      create: {
        name: 'Demo Creator',
        slug: 'demo-creator',
        storeDomain: 'demo.publica.now'
      }
    })

    // Create a basic article
    await prisma.article.upsert({
      where: { 
        creatorId_slug: {
          creatorId: creator.id,
          slug: 'welcome-to-publica'
        }
      },
      update: {},
      create: {
        title: 'Welcome to Publica.now',
        slug: 'welcome-to-publica',
        bodyMarkdown: `# Welcome to Publica.now!

This is a demo article to show how the platform works.

## Getting Started

1. Create content
2. Publish it
3. Build your audience
4. Monetize your work

*Happy creating!*`,
        contentType: 'text',
        visibility: 'free',
        status: 'published',
        creatorId: creator.id,
        publishedAt: new Date(),
        tags: 'demo,welcome,getting-started'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Simple demo creator created successfully',
      creator: creator
    })

  } catch (error) {
    console.error('Error creating simple demo creator:', error)
    return NextResponse.json(
      { error: 'Failed to create simple demo creator', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
