import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateCreatorSchema = z.object({
  name: z.string().min(1, 'Creator name is required'),
  branding: z.record(z.any()).optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the creator associated with this user using raw SQL
    const creators = await prisma.$queryRaw`
      SELECT 
        c.id, c.name, c.slug, c."storeDomain", c."encryptedPublicaApiToken", 
        c.branding, c."createdAt", c."updatedAt"
      FROM creators c
      JOIN memberships m ON c.id = m."creatorId"
      WHERE m."userId" = ${session.user.id}
      AND m.role = 'owner'
      LIMIT 1
    `

    const creator = (creators as any[])[0]

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    return NextResponse.json(creator)
  } catch (error) {
    console.error('Error fetching creator profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch creator profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Creator update request body:', body)
    
    const validatedData = updateCreatorSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Find the creator associated with this user using raw SQL
    const creators = await prisma.$queryRaw`
      SELECT 
        c.id, c.name, c.slug, c."storeDomain", c."encryptedPublicaApiToken", 
        c.branding, c."createdAt", c."updatedAt"
      FROM creators c
      JOIN memberships m ON c.id = m."creatorId"
      WHERE m."userId" = ${session.user.id}
      AND m.role = 'owner'
      LIMIT 1
    `

    const creator = (creators as any[])[0]

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    console.log('Found creator:', { id: creator.id, name: creator.name })

    // Update the creator using raw SQL
    const updatedCreators = await prisma.$queryRaw`
      UPDATE creators 
      SET name = ${validatedData.name}, 
          branding = ${validatedData.branding ? JSON.stringify(validatedData.branding) : creator.branding || null}, 
          "updatedAt" = NOW()
      WHERE id = ${creator.id}
      RETURNING *
    `

    const updatedCreator = (updatedCreators as any[])[0]

    return NextResponse.json(updatedCreator)
  } catch (error) {
    console.error('Error updating creator profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update creator profile' },
      { status: 500 }
    )
  }
}
