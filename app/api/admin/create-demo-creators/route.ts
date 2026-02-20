import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
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
        tags: 'web development,technology,career advice,programming'
      }
    })

    // Demo Creator 2: Marcus Rodriguez - Business Podcaster
    const marcus = await prisma.creator.upsert({
      where: { slug: 'marcus-rodriguez-business' },
      update: {},
      create: {
        name: 'Marcus Rodriguez',
        slug: 'marcus-rodriguez-business',
        storeDomain: 'marcus-rodriguez-business.publica.now',
        branding: {
          description: 'Business strategist and entrepreneur helping creators build sustainable income streams and grow their audiences.',
          mainColor: '#10B981',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          headerImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop'
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

    // Marcus's Articles
    await prisma.article.upsert({
      where: { 
        creatorId_slug: {
          creatorId: marcus.id,
          slug: 'content-monetization-strategies'
        }
      },
      update: {},
      create: {
        title: 'Content Monetization Strategies That Actually Work',
        slug: 'content-monetization-strategies',
        bodyMarkdown: `# Content Monetization Strategies That Actually Work

Creating great content is only half the battle. The real challenge is turning your passion into a sustainable income stream. Here are proven strategies that work in 2025.

## 1. Subscription Models

Subscription-based revenue is the most predictable and sustainable model for creators.

**Implementation tips:**
- Start with a free tier to build audience
- Offer exclusive content for subscribers
- Use tiered pricing ($5, $15, $50/month)
- Provide real value in each tier

## 2. Digital Products

Create products that complement your content and solve real problems.

**Product ideas:**
- E-books and guides
- Online courses
- Templates and tools
- Exclusive workshops

## 3. Community Building

Your audience is your greatest asset. Build a community around your content.

**Community strategies:**
- Discord or Slack groups
- Member-only events
- Peer-to-peer networking
- Exclusive Q&A sessions

## 4. Affiliate Marketing

Promote products you genuinely believe in and earn commissions.

**Best practices:**
- Only promote products you use
- Be transparent about affiliate links
- Focus on value, not just sales
- Build trust with your audience

## Getting Started

Choose one monetization strategy and master it before adding another. Start small, test, and iterate based on your audience's response.

Remember: monetization should enhance your content, not compromise it.`,
        contentType: 'text',
        visibility: 'paid',
        status: 'published',
        creatorId: marcus.id,
        publishedAt: new Date('2025-01-10'),
        tags: 'monetization,business strategy,content creation'
      }
    })

    console.log('✅ Demo creators created successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Demo creators created successfully',
      creators: [sarah, marcus]
    })

  } catch (error) {
    console.error('Error creating demo creators:', error)
    return NextResponse.json(
      { error: 'Failed to create demo creators', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
