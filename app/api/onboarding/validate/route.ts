import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PublicaClient } from '@/lib/publica'
import { encryptToken } from '@/lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const validationSchema = z.object({
  storeDomain: z.string().min(1),
  apiToken: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { storeDomain, apiToken } = validationSchema.parse(body)

    // Test the token by calling Publica API
    const publicaClient = new PublicaClient(storeDomain, apiToken)
    
    try {
      await publicaClient.getContent({ per_page: 1 })
    } catch (error) {
      console.error('Publica API test failed:', error)
      return NextResponse.json(
        { error: 'Invalid API token or store domain. Please check your credentials.' },
        { status: 400 }
      )
    }

    // Get user's creator space using raw SQL
    const memberships = await prisma.$queryRaw`
      SELECT 
        m.id,
        m."creatorId",
        c.id as "creatorId",
        c.slug as "creatorSlug"
      FROM memberships m
      JOIN creators c ON m."creatorId" = c.id
      WHERE m."userId" = ${session.user.id}
      AND m.role = 'owner'
      LIMIT 1
    `

    const membership = (memberships as any[])[0]

    if (!membership) {
      return NextResponse.json(
        { error: 'Creator space not found' },
        { status: 404 }
      )
    }

    // Update creator with validated credentials using raw SQL
    const encryptedToken = encryptToken(apiToken)
    
    await prisma.$queryRaw`
      UPDATE creators 
      SET "storeDomain" = ${storeDomain}, "encryptedPublicaApiToken" = ${encryptedToken}
      WHERE id = ${membership.creatorId}
    `

    return NextResponse.json({
      message: 'Publica integration validated successfully',
      creatorId: membership.creatorId,
    })

  } catch (error) {
    console.error('Onboarding validation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to validate Publica integration' },
      { status: 500 }
    )
  }
}
