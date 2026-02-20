import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import * as argon2 from 'argon2'

export const dynamic = 'force-dynamic'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)

    // Get the current user with password using raw SQL
    const users = await prisma.$queryRaw`
      SELECT "passwordHash" FROM users WHERE id = ${session.user.id}
    `

    const user = (users as any[])[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      )
    }
    
    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      validatedData.currentPassword
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedNewPassword = await argon2.hash(validatedData.newPassword)

    // Update the password using raw SQL
    await prisma.$queryRaw`
      UPDATE users 
      SET "passwordHash" = ${hashedNewPassword}
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
