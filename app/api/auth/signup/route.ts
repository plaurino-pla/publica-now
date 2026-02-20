import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'argon2'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1, 'Name is required'),
  creatorName: z.string().optional(), // Optional - can be set later
  creatorHandle: z.string()
    .min(3, 'Handle must be at least 3 characters long')
    .max(30, 'Handle must be less than 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Handle can only contain lowercase letters, numbers, and hyphens')
    .optional(), // Optional - can be set later
  description: z.string().optional().default(''),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, creatorName, creatorHandle, description } = signupSchema.parse(body)

    console.log('Signup attempt for:', { email, hasPassword: !!password, name, creatorName, creatorHandle })

    // Check if user already exists using raw SQL
    const existingUsers = await prisma.$queryRaw`
      SELECT id FROM users WHERE email = ${email}
    `

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // If creator fields are provided, validate them
    if (creatorName && creatorHandle) {
      // Check if creator handle already exists using raw SQL
      const existingCreators = await prisma.$queryRaw`
        SELECT id FROM creators WHERE slug = ${creatorHandle}
      `

      if ((existingCreators as any[]).length > 0) {
        return NextResponse.json(
          { error: 'This handle is already taken. Please choose a different one.' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const passwordHash = await hash(password)

    // Generate UUID for user ID
    const userId = crypto.randomUUID()

    // Create user using raw SQL with correct schema
    const userResult = await prisma.$queryRaw`
      INSERT INTO users (id, email, "passwordHash", "updatedAt")
      VALUES (${userId}, ${email}, ${passwordHash}, NOW())
      RETURNING id
    `

    const user = (userResult as any[])[0]
    console.log('User created successfully:', user.id)

    let creator = null
    let membership = null

    // Create creator space if creator fields are provided
    if (creatorName && creatorHandle) {
      try {
        const creatorId = crypto.randomUUID()
        
        creator = await prisma.$queryRaw`
          INSERT INTO creators (
            id, slug, name, "storeDomain", "encryptedPublicaApiToken", branding, "updatedAt"
          )
          VALUES (
            ${creatorId}, ${creatorHandle}, ${creatorName}, ${creatorHandle + '.publica.now'}, '', 
            ${description ? JSON.stringify({ description }) : null}, NOW()
          )
          RETURNING id
        `

        // Create membership
        const membershipId = crypto.randomUUID()
        membership = await prisma.$queryRaw`
          INSERT INTO memberships (id, "userId", "creatorId", role)
          VALUES (${membershipId}, ${user.id}, ${creatorId}, 'owner')
          RETURNING id
        `

        console.log('Creator and membership created successfully')
      } catch (creatorError) {
        console.error('Failed to create creator:', creatorError)
        // Continue without creator - user account was created successfully
      }
    }

    return NextResponse.json({
      message: creatorName && creatorHandle ? 'User and creator account created successfully' : 'User account created successfully',
      userId: user.id,
      creatorId: creator ? (creator as any[])[0].id : null,
      creatorSlug: creatorHandle || null,
      isCreator: !!(creatorName && creatorHandle),
    })

  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    )
  }
}
