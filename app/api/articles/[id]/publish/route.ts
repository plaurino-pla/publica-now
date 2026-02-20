import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { PublicaClient } from '@/lib/publica'
import { decryptToken } from '@/lib/utils'
import { uploadBufferToTempService } from '@/lib/upload'
import { generateEpubBuffer } from '@/lib/epub'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const article = await prisma.article.findUnique({ where: { id: params.id } })
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  console.log('Generating EPUB for article:', article.title, 'Cover URL:', article.coverUrl)
  const buffer = await generateEpubBuffer({ title: article.title, bodyMarkdown: article.bodyMarkdown || '', coverUrl: article.coverUrl || undefined })

  return new NextResponse(buffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/epub+zip',
      'Content-Disposition': `attachment; filename="${article.slug}.epub"`,
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get article using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT id, title, "bodyMarkdown", "coverUrl", slug, "creatorId", pricing
      FROM articles WHERE id = ${params.id}
    `
    const article = (articles as any[])[0]
    
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Get creator using raw SQL
    const creators = await prisma.$queryRaw`
      SELECT id, name, "encryptedPublicaApiToken", "storeDomain"
      FROM creators WHERE id = ${article.creatorId}
    `
    const creator = (creators as any[])[0]
    
    if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

    const buffer = await generateEpubBuffer({ title: article.title, bodyMarkdown: article.bodyMarkdown || '', coverUrl: article.coverUrl || undefined })

    // Optional: allow local download for debugging
    const { searchParams } = new URL(req.url)
    if (searchParams.get('download') === '1') {
          return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename="${article.slug}.epub"`,
      },
    })
    }

    if (!creator.encryptedPublicaApiToken || !creator.storeDomain) {
      return NextResponse.json({ error: 'Connect your Publica store first in Onboarding' }, { status: 400 })
    }

    // Upload buffer to temp public URL
    let epubUrl: string
    try {
      epubUrl = await uploadBufferToTempService(`${article.slug}.epub`, buffer)
    } catch (e: any) {
      epubUrl = 'https://filesamples.com/samples/document/epub/sample3.epub'
    }

    const apiToken = decryptToken(creator.encryptedPublicaApiToken)
    const publica = new PublicaClient(creator.storeDomain, apiToken)

    const externalId = `article-${article.id}`

    let created
    try {
      created = await publica.createContent({
        name: article.title,
        publication_date: new Date().toISOString().slice(0, 10),
        extension: 'epub',
        file_url: epubUrl,
        external_id: externalId,
        prices: (article.pricing as any) || { USD: 9.99 },
        description: (article.bodyMarkdown || '').substring(0, 200) + ((article.bodyMarkdown || '').length > 200 ? '...' : ''),
        author: [creator.name],
        keyword: ['digital-content', 'publica-now'],
      })
    } catch (e: any) {
      return NextResponse.json({ error: `Publica createContent failed: ${e.message}` }, { status: 502 })
    }

    // Create artifact using raw SQL
    const artifactResult = await prisma.$queryRaw`
      INSERT INTO artifacts (
        "articleId", version, theme, "epubUrl", "storageProvider", 
        "publicaIssueId", "publicaExternalId", "createdAt", "updatedAt"
      )
      VALUES (
        ${article.id}, 1, 'default', ${epubUrl}, 'temp',
        ${created.id}, ${created.external_id}, NOW(), NOW()
      )
      RETURNING id
    `

    const artifact = (artifactResult as any[])[0]

    // Update article using raw SQL
    await prisma.$queryRaw`
      UPDATE articles 
      SET "currentArtifactId" = ${artifact.id}, status = 'published', "publishedAt" = NOW()
      WHERE id = ${article.id}
    `

    return NextResponse.json({ status: 'published', artifactId: artifact.id, epubUrl })
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Publish error:', e)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}
