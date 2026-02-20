const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDemoCreators() {
  try {
    console.log('Creating demo creators and content...')

    // Demo Creator 1: Sarah Chen - Tech Writer
    const sarah = await prisma.creator.upsert({
      where: { slug: 'sarah-chen-tech' },
      update: {},
      create: {
        name: 'Sarah Chen',
        slug: 'sarah-chen-tech',
        storeDomain: 'sarah-chen-tech.publica.now',
        encryptedPublicaApiToken: 'demo-token-sarah',
        branding: {
          description: 'Tech writer and software engineer sharing insights on modern development practices, career growth, and industry trends.',
          mainColor: '#3B82F6',
          profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
          headerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop'
        }
      }
    })

    // Create user for Sarah
    const sarahUser = await prisma.user.upsert({
      where: { email: 'sarah@demo.publica.now' },
      update: {},
      create: {
        email: 'sarah@demo.publica.now',
        memberships: {
          create: {
            creatorId: sarah.id,
            role: 'owner'
          }
        }
      }
    })

    // Sarah's Articles
    await prisma.article.upsert({
      where: { 
        creatorId_slug: {
          creatorId: sarah.id,
          slug: 'future-web-development-2025'
        }
      },
      update: {},
      create: {
        title: 'The Future of Web Development: What to Learn in 2025',
        slug: 'future-web-development-2025',
        bodyMarkdown: `# The Future of Web Development: What to Learn in 2025

Web development is evolving at an unprecedented pace. As we approach 2025, several key trends are shaping the industry and creating new opportunities for developers.

## 1. AI-Powered Development Tools

Artificial intelligence is revolutionizing how we write code. From GitHub Copilot to advanced debugging tools, AI assistants are becoming indispensable for modern developers.

**Key areas to focus on:**
- Prompt engineering for AI tools
- Understanding AI-generated code
- Integrating AI services into applications

## 2. WebAssembly (WASM) Goes Mainstream

WebAssembly is no longer just a promising technology—it's becoming essential for performance-critical web applications.

**Why WASM matters:**
- Near-native performance in the browser
- Language agnostic (C++, Rust, Go, etc.)
- Perfect for gaming, video editing, and data processing

## 3. Edge Computing and Serverless

The future is distributed, and edge computing is leading the charge.

**Benefits:**
- Lower latency for global users
- Reduced server costs
- Better scalability

## 4. Modern CSS and Design Systems

CSS is more powerful than ever, and design systems are becoming standard practice.

**Must-know technologies:**
- CSS Grid and Flexbox mastery
- CSS Custom Properties
- Design token systems
- Component-driven development

## Getting Started

The best approach is to pick one area and dive deep. Don't try to learn everything at once—focus on mastering the fundamentals while staying aware of emerging trends.

Remember: the most successful developers are those who can adapt to change while maintaining strong foundational skills.`,
        contentType: 'text',
        visibility: 'free',
        status: 'published',
        creatorId: sarah.id,
        publishedAt: new Date('2025-01-15'),
        tags: ['web development', 'technology', 'career advice', 'programming']
      }
    })

    await prisma.article.upsert({
      where: { 
        creatorId_slug: {
          creatorId: sarah.id,
          slug: 'scalable-microservices-nodejs'
        }
      },
      update: {},
      create: {
        title: 'Building Scalable Microservices with Node.js',
        slug: 'scalable-microservices-nodejs',
        bodyMarkdown: `# Building Scalable Microservices with Node.js

Microservices architecture has become the standard for building large-scale applications. In this guide, we'll explore how to implement microservices using Node.js.

## Architecture Overview

A well-designed microservices architecture consists of:

- **API Gateway**: Routes requests to appropriate services
- **Service Discovery**: Locates services dynamically
- **Load Balancing**: Distributes traffic evenly
- **Circuit Breakers**: Prevents cascading failures

## Implementation Steps

### 1. Service Design

Each microservice should have a single responsibility and clear boundaries.

### 2. Communication Patterns

Choose between synchronous (REST) and asynchronous (message queues) communication based on your needs.

### 3. Data Management

Each service should have its own database, following the database-per-service pattern.

## Best Practices

- Keep services small and focused
- Use asynchronous communication when possible
- Implement proper monitoring and logging
- Design for failure and resilience

The key to success is starting simple and gradually adding complexity as your system grows.`,
        contentType: 'text',
        visibility: 'preview',
        status: 'published',
        creatorId: sarah.id,
        publishedAt: new Date('2025-01-20'),
        tags: ['nodejs', 'microservices', 'architecture', 'backend']
      }
    })

    // Demo Creator 2: Marcus Rodriguez - Podcast Host
    const marcus = await prisma.creator.upsert({
      where: { slug: 'marcus-rodriguez-podcast' },
      update: {},
      create: {
        name: 'Marcus Rodriguez',
        slug: 'marcus-rodriguez-podcast',
        storeDomain: 'marcus-rodriguez-podcast.publica.now',
        encryptedPublicaApiToken: 'demo-token-marcus',
        branding: {
          description: 'Host of "The Creative Entrepreneur" podcast, helping creators turn their passion into profitable businesses.',
          mainColor: '#10B981',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          headerImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop'
        }
      }
    })

    // Create user for Marcus
    const marcusUser = await prisma.user.upsert({
      where: { email: 'marcus@demo.publica.now' },
      update: {},
      create: {
        email: 'marcus@demo.publica.now',
        memberships: {
          create: {
            creatorId: marcus.id,
            role: 'owner'
          }
        }
      }
    })

    // Marcus's Audio Content
    await prisma.article.upsert({
      where: { 
        creatorId_slug: {
          creatorId: marcus.id,
          slug: 'episode-45-six-figure-creator-business'
        }
      },
      update: {},
      create: {
        title: 'Episode 45: How to Build a 6-Figure Creator Business',
        slug: 'episode-45-six-figure-creator-business',
        bodyMarkdown: `# Episode 45: How to Build a 6-Figure Creator Business

Welcome to The Creative Entrepreneur podcast! I'm Marcus Rodriguez, and today we're diving deep into the strategies that can help you build a six-figure creator business.

## What You'll Learn

- The 3 pillars of sustainable creator income
- How to diversify your revenue streams
- Building an engaged audience that converts
- Pricing strategies that maximize your earnings

## Key Takeaways

Building a successful creator business isn't about going viral once—it's about building systems that generate consistent income month after month.

The most successful creators I've interviewed all follow a similar pattern: they create valuable content, build relationships with their audience, and monetize through multiple channels.

## Resources Mentioned

- Creator Economy Report 2025
- Audience Building Masterclass
- Revenue Diversification Framework

Remember: success in the creator economy is a marathon, not a sprint. Focus on building sustainable systems rather than chasing viral moments.`,
        contentType: 'audio',
        visibility: 'free',
        status: 'published',
        creatorId: marcus.id,
        publishedAt: new Date('2025-01-10'),
        audioUrl: 'https://demo-audio-files.publica.now/episode-45.mp3',
        tags: ['podcast', 'business', 'creativity', 'entrepreneurship']
      }
    })

    await prisma.article.upsert({
      where: { 
        creatorId_slug: {
          creatorId: marcus.id,
          slug: 'episode-44-monetization-strategies'
        }
      },
      update: {},
      create: {
        title: 'Episode 44: Monetization Strategies for Content Creators',
        slug: 'episode-44-monetization-strategies',
        bodyMarkdown: `# Episode 44: Monetization Strategies for Content Creators

Today we're exploring the various ways you can monetize your content and build multiple income streams.

## Monetization Methods

### 1. Subscriptions and Memberships
- Premium content tiers
- Exclusive community access
- Early access to new content

### 2. Digital Products
- Online courses and workshops
- E-books and guides
- Templates and resources

### 3. Brand Partnerships
- Sponsored content
- Affiliate marketing
- Product collaborations

## Finding Your Sweet Spot

The key is to experiment with different monetization methods and find what works best for your audience and content type.

Don't be afraid to start small and scale up as you learn what resonates with your community.`,
        contentType: 'audio',
        visibility: 'paid',
        status: 'published',
        creatorId: marcus.id,
        publishedAt: new Date('2025-01-05'),
        audioUrl: 'https://demo-audio-files.publica.now/episode-44.mp3',
        pricing: { USD: 4.99 },
        tags: ['monetization', 'business strategy', 'content creation']
      }
    })

    // Demo Creator 3: Elena Petrov - Visual Artist
    const elena = await prisma.creator.upsert({
      where: { slug: 'elena-petrov-artist' },
      update: {},
      create: {
        name: 'Elena Petrov',
        slug: 'elena-petrov-artist',
        storeDomain: 'elena-petrov-artist.publica.now',
        encryptedPublicaApiToken: 'demo-token-elena',
        branding: {
          description: 'Digital artist and illustrator creating whimsical worlds and characters. Available for commissions and custom artwork.',
          mainColor: '#8B5CF6',
          profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
          headerImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop'
        }
      }
    })

    // Create user for Elena
    const elenaUser = await prisma.user.upsert({
      where: { email: 'elena@demo.publica.now' },
      update: {},
      create: {
        email: 'elena@demo.publica.now',
        memberships: {
          create: {
            creatorId: elena.id,
            role: 'owner'
          }
        }
      }
    })

    // Elena's Image Content
    await prisma.article.upsert({
      where: { 
        creatorId_slug: {
          creatorId: elena.id,
          slug: 'whimsical-forest-collection'
        }
      },
      update: {},
      create: {
        title: 'Whimsical Forest Collection: Digital Art Prints',
        slug: 'whimsical-forest-collection',
        bodyMarkdown: `# Whimsical Forest Collection: Digital Art Prints

Welcome to my latest collection of digital art prints! This series explores the magical world of enchanted forests, where every tree has a story and every creature has a secret.

## About the Collection

Each piece in this collection was created using a combination of digital painting techniques and traditional illustration principles. I spent months developing the unique style that brings these whimsical worlds to life.

## What's Included

- 10 high-resolution digital art prints
- Multiple format options (PNG, JPG, PDF)
- Commercial use license
- Behind-the-scenes creation process

## The Inspiration

These pieces were inspired by my childhood memories of exploring the forests near my grandmother's house. I wanted to capture that sense of wonder and mystery that nature holds.

## Perfect For

- Home and office decoration
- Children's room artwork
- Fantasy and nature lovers
- Digital art collectors

Each print is available individually or as part of the complete collection.`,
        contentType: 'image',
        visibility: 'paid',
        status: 'published',
        creatorId: elena.id,
        publishedAt: new Date('2025-01-18'),
        imageUrls: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop'
        ],
        pricing: { USD: 24.99 },
        tags: ['digital art', 'illustration', 'fantasy', 'nature', 'prints']
      }
    })

    await prisma.article.upsert({
      where: { 
        creatorId_slug: {
          creatorId: elena.id,
          slug: 'character-design-workshop'
        }
      },
      update: {},
      create: {
        title: 'Character Design Workshop: Creating Memorable Characters',
        slug: 'character-design-workshop',
        bodyMarkdown: `# Character Design Workshop: Creating Memorable Characters

Join me for an in-depth workshop on character design! Whether you're a beginner or experienced artist, this workshop will help you create characters that truly stand out.

## Workshop Content

### Week 1: Character Fundamentals
- Understanding character archetypes
- Basic anatomy and proportions
- Personality and expression

### Week 2: Design Principles
- Silhouette and readability
- Color theory for characters
- Costume and accessory design

### Week 3: Bringing Characters to Life
- Posing and body language
- Facial expressions and emotions
- Character consistency

## What You'll Get

- 3 weeks of video lessons
- Downloadable reference materials
- Character design templates
- Community feedback sessions
- Certificate of completion

## Who This Is For

- Aspiring character designers
- Game developers and animators
- Children's book illustrators
- Anyone interested in character creation

This workshop represents years of experience in character design and is designed to give you practical skills you can use immediately.`,
        contentType: 'text',
        visibility: 'preview',
        status: 'published',
        creatorId: elena.id,
        publishedAt: new Date('2025-01-12'),
        tags: ['character design', 'workshop', 'art education', 'digital art']
      }
    })

    console.log('✅ Demo creators and content created successfully!')
    console.log('\nCreated creators:')
    console.log('1. Sarah Chen - Tech Writer (2 articles)')
    console.log('2. Marcus Rodriguez - Podcast Host (2 episodes)')
    console.log('3. Elena Petrov - Visual Artist (1 image collection + 1 workshop)')
    
    console.log('\nContent types showcased:')
    console.log('- Text articles (free and preview)')
    console.log('- Audio content (free and paid)')
    console.log('- Image collections (paid)')
    console.log('- Mixed content strategies')

  } catch (error) {
    console.error('❌ Error creating demo creators:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoCreators()
