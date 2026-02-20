import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verify } from 'argon2'
import crypto from 'crypto'

// Generate a secure secret if NEXTAUTH_SECRET is not provided
const generateSecret = () => {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET
  }
  
  // Generate a secure random secret for production
  if (process.env.NODE_ENV === 'production') {
    console.warn('NEXTAUTH_SECRET not set in production. Generating a temporary secret.')
    return crypto.randomBytes(32).toString('hex')
  }
  
  // Use a fallback for development
  return 'dev-secret-key-not-for-production'
}

// Get the correct URL for NextAuth
const getAuthUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Try to determine the URL from the environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.warn('NEXTAUTH_URL not set in production. This may cause issues.')
  }
  
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

// Check if email is properly configured
const isEmailConfigured = () => {
  return !!(
    process.env.POSTMARK_API_TOKEN ||
    (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD)
  )
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled due to schema mismatch
  secret: generateSecret(),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }

          console.log('Attempting to authenticate:', credentials.email)

          // Use raw SQL to get user data
          const users = await prisma.$queryRaw`
            SELECT id, email, "passwordHash"
            FROM users
            WHERE email = ${credentials.email}
            LIMIT 1
          `

          const user = (users as any[])[0]
          if (!user || !user.passwordHash) {
            console.log('User not found or no password hash')
            return null
          }

          console.log('User found, verifying password')

          const isValidPassword = await verify(user.passwordHash, credentials.password)
          
          if (!isValidPassword) {
            console.log('Invalid password')
            return null
          }

          console.log('Password verified successfully')

          return {
            id: user.id,
            email: user.email,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    }),
    // Temporarily disabled EmailProvider to focus on basic authentication
    // ...(isEmailConfigured() ? [
    //   EmailProvider({
    //     server: process.env.POSTMARK_API_TOKEN ? {
    //       // Use Postmark if available - Postmark uses API token as both username and password
    //       host: 'smtp.postmarkapp.com',
    //       port: 587,
    //       auth: {
    //         user: process.env.POSTMARK_API_TOKEN,
    //         pass: process.env.POSTMARK_API_TOKEN,
    //       },
    //       secure: false, // Use STARTTLS
    //       tls: {
    //         rejectUnauthorized: false
    //       }
    //     } : {
    //       // Fallback to generic SMTP
    //       host: process.env.EMAIL_SERVER_HOST!,
    //       port: Number(process.env.EMAIL_SERVER_PORT || 587),
    //       auth: {
    //         user: process.env.EMAIL_SERVER_USER!,
    //         pass: process.env.EMAIL_SERVER_PASSWORD!,
    //       },
    //     },
    //     from: process.env.EMAIL_FROM || 'noreply@publica.now',
    //     // Custom sendVerificationRequest for Postmark API
    //     ...(process.env.POSTMARK_API_TOKEN && {
    //       async sendVerificationRequest({
    //         identifier: email,
    //         url,
    //         provider,
    //       }: {
    //         identifier: string
    //         url: string
    //         provider: any
    //       }) {
    //         try {
    //           const response = await fetch('https://api.postmarkapp.com/email', {
    //             method: 'POST',
    //             headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json',
    //               'X-Postmark-Server-Token': process.env.POSTMARK_API_TOKEN!,
    //               },
    //               body: JSON.stringify({
    //                 From: provider.from,
    //                 To: email,
    //                 Subject: 'Sign in to Publica.la',
    //                 TextBody: `Click this link to sign in: ${url}`,
    //                 HtmlBody: `
    //                   <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    //                     <h2>Sign in to Publica.la</h2>
    //                     <p>Click the button below to sign in to your account:</p>
    //                     <a href="${url}" style="display: break-all; color: #666;">${url}</p>
    //                     <p>This link will expire in 24 hours.</p>
    //                   </div>
    //                 `,
    //               }),
    //             })

    //             if (!response.ok) {
    //               const error = await response.text()
    //               throw new Error(`Postmark API error: ${error}`)
    //             }

    //             console.log('Magic link email sent successfully via Postmark API')
    //           } catch (error) {
    //             console.error('Failed to send magic link email:', error)
    //             throw error
    //           }
    //         }
    //       })
    //     })
    //   })
    // ] : []),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore augment token with id
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // @ts-ignore add id to session.user
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  debug: process.env.NODE_ENV === 'development',
}
