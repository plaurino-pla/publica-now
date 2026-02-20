import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'argon2'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Test database connection
    const users = await prisma.$queryRaw`
      SELECT id, email, "passwordHash"
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    
    const user = (users as any[])[0]
    if (!user || !user.passwordHash) {
      return NextResponse.json({ 
        error: 'User not found or no password hash',
        userFound: !!user,
        hasPasswordHash: !!(user?.passwordHash)
      })
    }
    
    // Test password verification
    const isValidPassword = await verify(user.passwordHash, password)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        hasPasswordHash: !!user.passwordHash
      },
      passwordValid: isValidPassword
    })
    
  } catch (error) {
    console.error('Debug auth test error:', error)
    return NextResponse.json({ 
      error: 'Debug auth test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
