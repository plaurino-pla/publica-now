import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CloudflareStreamClient } from '@/lib/cloudflare'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const accountId = process.env.CF_STREAM_ACCOUNT_ID
    const apiToken = process.env.CF_STREAM_API_TOKEN
    let allowedOrigins: string[] | undefined
    if (process.env.NEXT_PUBLIC_APP_URL) {
      try {
        const u = new URL(process.env.NEXT_PUBLIC_APP_URL)
        allowedOrigins = [u.host]
      } catch {
        // fallback: use as provided but without protocol prefix if present
        allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, '')]
      }
    }

    if (!accountId || !apiToken) {
      return NextResponse.json({ error: 'Cloudflare Stream not configured' }, { status: 500 })
    }

    const client = new CloudflareStreamClient(accountId, apiToken)
    const { uploadURL, uid } = await client.createDirectUpload({
      allowedOrigins,
      requireSignedURLs: false,
      maxDurationSeconds: 7200,
      metadata: { userId: session.user.id },
    })

    return NextResponse.json({ uploadURL, uid })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create direct upload' }, { status: 500 })
  }
}


