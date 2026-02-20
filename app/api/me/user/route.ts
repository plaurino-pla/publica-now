import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateUserSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data using raw SQL
    const users = await prisma.$queryRaw`
      SELECT id, email FROM users WHERE id = ${session.user.id}
    `

    const user = (users as any[])[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
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
    const validatedData = updateUserSchema.parse(body)

    // Check if email is already taken by another user using raw SQL
    const existingUsers = await prisma.$queryRaw`
      SELECT id FROM users 
      WHERE email = ${validatedData.email} 
      AND id != ${session.user.id}
    `

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 400 }
      )
    }

    // Update the user using raw SQL
    const updatedUsers = await prisma.$queryRaw`
      UPDATE users 
      SET email = ${validatedData.email}
      WHERE id = ${session.user.id}
      RETURNING id, email
    `

    const updatedUser = (updatedUsers as any[])[0]

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
