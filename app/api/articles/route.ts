import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const articleSchema = z.object({
  title: z.string().min(1),
  coverUrl: z.string().optional().nullable(),
  bodyMarkdown: z.string().min(1),
  contentType: z.enum(['text', 'audio', 'image', 'video']).default('text'),
  audioUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  videoId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['free', 'paid', 'subscribers']).default('free'), // free, paid (one-time), or subscribers-only
  pricing: z.record(z.number()).nullable().optional(), // Only used when visibility is 'paid'
})

function sanitizeCoverUrl(value?: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  try {
    const u = new URL(trimmed)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString()
  } catch {}
  return undefined
}

async function notifyPublicaLa(article: any) {
  if (process.env.PUBLICA_API_URL && process.env.PUBLICA_API_TOKEN && article.contentType === 'audio') {
    try {
      console.log('Notifying publica.la about new audio post:', article.id)
      
      const webhookResponse = await fetch(`${process.env.PUBLICA_API_URL}/webhooks/content-created`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PUBLICA_API_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Tenant-URL': process.env.PUBLICA_TENANT_URL || '',
        },
        body: JSON.stringify({
          articleId: article.id,
          title: article.title,
          contentType: 'audio',
          audioUrl: article.audioUrl,
          visibility: article.visibility,
          pricing: article.pricing || null,
          createdAt: article.createdAt,
        }),
      })
      
      if (webhookResponse.ok) {
        console.log('Successfully notified publica.la')
        return true
      } else {
        console.error('Failed to notify publica.la:', await webhookResponse.text())
        return false
      }
    } catch (error) {
      console.error('Error notifying publica.la:', error)
      return false
    }
  }
  return false
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user's creator membership using raw SQL
    let memberships: any[] = []
    try {
      memberships = await prisma.$queryRaw`
        SELECT "creatorId" FROM memberships 
        WHERE "userId" = ${session.user.id} 
        AND role = 'owner'
        LIMIT 1
      `
    } catch (error) {
      console.log('Memberships table not found, creating it and setting up creator account')
      // Create memberships table if it doesn't exist
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS memberships (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "creatorId" TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
          role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE("userId", "creatorId")
        )
      `)
      memberships = []
    }

    let membership = (memberships as any[])[0]
    
    // If user doesn't have a creator account, create one automatically
    if (!membership) {
      console.log('User does not have creator account, creating one automatically')
      
      // Get user info
      const users = await prisma.$queryRaw`
        SELECT email FROM users WHERE id = ${session.user.id} LIMIT 1
      `
      const user = (users as any[])[0]
      
      // Create a creator account for the user
      const creatorResult = await prisma.$queryRaw`
        INSERT INTO creators (
          id, slug, name, "storeDomain", "encryptedPublicaApiToken", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid()::text,
          ${'creator-' + Math.random().toString(36).slice(2, 6)},
          ${'My Creator Space'},
          ${'creator-' + Math.random().toString(36).slice(2, 6) + '.publica.now'},
          ${'demo-token-' + Math.random().toString(36).slice(2, 6)},
          NOW(),
          NOW()
        )
        RETURNING id
      `
      
      const creator = (creatorResult as any[])[0]
      
      // Create membership linking user to creator with owner role
      await prisma.$queryRaw`
        INSERT INTO memberships (
          id, "userId", "creatorId", role, "createdAt"
        )
        VALUES (
          gen_random_uuid()::text,
          ${session.user.id},
          ${creator.id},
          'owner',
          NOW()
        )
      `
      
      membership = { creatorId: creator.id }
      console.log('✅ Created creator account for user:', session.user.id)
    }

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    console.log('Request body:', body)
    const data = articleSchema.parse(body)

    // Debug: log the parsed data
    console.log('Parsed data:', data)
    console.log('Tags before processing:', data.tags)

    // Create article using raw SQL
    const articleResult = await prisma.$queryRaw`
      INSERT INTO articles (
        id, "creatorId", title, slug, "coverUrl", tags, "bodyMarkdown", 
        "contentType", "audioUrl", "imageUrls", "videoUrl", "videoId", 
        status, visibility, pricing, "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${membership.creatorId}, 
        ${data.title}, 
        ${generateSlug(data.title) + '-' + Math.random().toString(36).slice(2, 6)}, 
        ${sanitizeCoverUrl(data.coverUrl ?? undefined)},
        ${data.tags && data.tags.length > 0 ? data.tags.join(',') : null},
        ${data.bodyMarkdown},
        ${data.contentType},
        ${data.audioUrl || null},
        ${data.imageUrls ? JSON.stringify(data.imageUrls) : '[]'}::jsonb,
        ${data.videoUrl || null},
        ${data.videoId || null},
        'ready',
        ${data.visibility},
        ${data.visibility === 'paid' && data.pricing ? JSON.stringify(data.pricing) : null}::jsonb,
        NOW(),
        NOW()
      )
      RETURNING id
    `

    const article = (articleResult as any[])[0]

    // Note: Audio posts are now sent to publica.la immediately after creation
    // via the /api/articles/audio/publica endpoint

    return NextResponse.json({ id: article.id })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Create article error:', err)
    if (err?.issues) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
    }
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate slug, try a different title' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create article', message: err.message || 'Unknown error' }, { status: 500 })
  }
}
