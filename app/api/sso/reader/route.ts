import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SignJWT } from 'jose'
import { z } from 'zod'

const ssoSchema = z.object({
  creatorSlug: z.string(),
  postId: z.string().optional(),
  intendedUrl: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // TODO: Implement SSO reader functionality when Order model is added to schema
  return NextResponse.json(
    { error: 'SSO reader functionality not yet implemented' },
    { status: 501 }
  )
}
