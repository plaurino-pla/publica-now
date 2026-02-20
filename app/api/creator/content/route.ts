import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PublicaClient } from '@/lib/publica'
import { decryptToken, generateSlug } from '@/lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const contentSchema = z.object({
  creatorId: z.string(),
  title: z.string().min(1),
  summary: z.string().optional(),
  coverUrl: z.string().url().optional(),
  kind: z.enum(['pdf', 'epub', 'audio']),
  fileUrl: z.string().url(),
  extension: z.enum(['pdf', 'epub', 'mp3', 'mpga']),
  pricing: z.object({ USD: z.number().optional(), EUR: z.number().optional() }).partial().optional(),
  visibility: z.enum(['free', 'paid', 'subscribers']).default('paid'),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = contentSchema.parse(body)

    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, creatorId: parsed.creatorId, role: { in: ['owner', 'editor'] } },
      include: { creator: true },
    })
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const creator = membership.creator
    if (!creator.encryptedPublicaApiToken || !creator.storeDomain) {
      return NextResponse.json({ error: 'Publica API token or store domain not configured' }, { status: 400 })
    }
    const apiToken = decryptToken(creator.encryptedPublicaApiToken)
    const publica = new PublicaClient(creator.storeDomain, apiToken)

    const externalId = `post-${Date.now()}`

    const created = await publica.createContent({
      name: parsed.title,
      publication_date: new Date().toISOString(),
      extension: parsed.extension,
      file_url: parsed.fileUrl,
      external_id: externalId,
      prices: parsed.pricing,
      description: parsed.description,
    })

    const post = await prisma.article.create({
      data: {
        creatorId: creator.id,
        title: parsed.title,
        slug: generateSlug(parsed.title),
        bodyMarkdown: parsed.description || '',
        coverUrl: parsed.coverUrl,
        contentType: parsed.kind,
        status: 'published',
        visibility: parsed.visibility,
        pricing: parsed.pricing || undefined,
        publishedAt: new Date(),
      },
    })

    return NextResponse.json({ id: post.id })
  } catch (error) {
    console.error('Create content error:', error)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}
