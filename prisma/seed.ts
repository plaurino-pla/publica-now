import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const demoPasswordHash = await hash('demo123')
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@publica.now' },
    update: {},
    create: {
      email: 'demo@publica.now',
      passwordHash: demoPasswordHash,
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Create demo creator profile
  const demoCreator = await prisma.creator.upsert({
    where: { slug: 'demo-creator' },
    update: {},
    create: {
      slug: 'demo-creator',
      name: 'Demo Creator',
      storeDomain: 'demo.publica.la',
      encryptedPublicaApiToken: 'demo-token',
    },
  })

  console.log('✅ Demo creator created:', demoCreator.name)

  // Create membership
  await prisma.membership.upsert({
    where: { 
      userId_creatorId: { 
        userId: demoUser.id, 
        creatorId: demoCreator.id 
      } 
    },
    update: {},
    create: {
      userId: demoUser.id,
      creatorId: demoCreator.id,
      role: 'owner',
    },
  })

  console.log('✅ Demo membership created')

  // Create some sample articles
  const sampleArticles = [
    {
      title: 'Welcome to Publica.now',
      slug: 'welcome-to-publica-now',
      bodyMarkdown: `# Welcome to Publica.now!

This is your first piece of content. You can:

- **Write** in our rich text editor
- **Format** with Markdown
- **Publish** instantly
- **Monetize** your content

## Getting Started

1. Create new content
2. Write your story
3. Set pricing and visibility
4. Publish and share!

*Happy creating!*`,
      visibility: 'free' as const,
      status: 'published' as const,
      tags: 'welcome,getting-started',
      publishedAt: new Date(),
    },
    {
      title: 'The Art of Content Creation',
      slug: 'art-of-content-creation',
      bodyMarkdown: `# The Art of Content Creation

Creating compelling content is both an art and a science. Here are some key principles:

## 1. Know Your Audience
Understanding who you're writing for is crucial.

## 2. Tell a Story
People love stories. Make your content narrative-driven.

## 3. Provide Value
Every piece should offer something valuable to your readers.

## 4. Be Authentic
Your unique voice is your greatest asset.

*Keep creating, keep growing!*`,
      visibility: 'preview' as const,
      status: 'published' as const,
      tags: 'content-creation,tips,writing',
      pricing: { USD: 4.99 },
      publishedAt: new Date(),
    }
  ]

  for (const articleData of sampleArticles) {
    await prisma.article.upsert({
      where: { 
        creatorId_slug: { 
          creatorId: demoCreator.id, 
          slug: articleData.slug 
        } 
      },
      update: {},
      create: {
        ...articleData,
        creatorId: demoCreator.id,
      },
    })
  }

  console.log('✅ Sample articles created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
