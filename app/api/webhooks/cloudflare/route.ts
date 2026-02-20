import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CloudflareStreamClient } from '@/lib/cloudflare'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Example event: { type: 'video.ready', uid, status, meta }
    const { type, uid, meta } = body || {}

    if (type === 'video.ready' && uid) {
      // Ensure allowed origin includes our host to avoid CORS playback issues
      const accountId = process.env.CF_STREAM_ACCOUNT_ID
      const apiToken = process.env.CF_STREAM_API_TOKEN
      let allowedOrigins: string[] | undefined
      if (process.env.NEXT_PUBLIC_APP_URL) {
        try {
          const u = new URL(process.env.NEXT_PUBLIC_APP_URL)
          allowedOrigins = [u.host]
        } catch {
          allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, '')]
        }
      }
      if (accountId && apiToken) {
        try {
          const cf = new CloudflareStreamClient(accountId, apiToken)
          const origins = [
            ...(allowedOrigins || []),
            'iframe.videodelivery.net'
          ]
          await cf.updateVideo(uid, { allowedOrigins: origins, requireSignedURLs: false })
        } catch (_) {}
      }

      // Update by explicit articleId if provided
      if (meta?.articleId) {
        await prisma.article.update({
          where: { id: meta.articleId },
          data: {
            status: 'published',
            pricing: {
              provider: {
                cloudflare: {
                  uid,
                  readyAt: new Date().toISOString(),
                }
              }
            } as any
          }
        })
      }

      // Also try to find an article created after upload by matching videoId==uid
      const byUid = await prisma.article.findFirst({ where: { videoId: uid } })
      if (byUid) {
        await prisma.article.update({
          where: { id: byUid.id },
          data: {
            status: 'published',
            pricing: {
              ...(byUid.pricing as any || {}),
              provider: {
                cloudflare: {
                  uid,
                  readyAt: new Date().toISOString(),
                }
              }
            } as any
          }
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Webhook error' }, { status: 500 })
  }
}


