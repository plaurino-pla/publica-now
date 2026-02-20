'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const form = new FormData(e.currentTarget)
      const email = form.get('email') as string
      const password = form.get('password') as string
      const name = form.get('name') as string
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        try {
          const signInResponse = await fetch('/api/auth/callback/credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              callbackUrl: '/dashboard',
              json: true,
            }),
          })

          if (signInResponse.ok) {
            router.push('/dashboard')
          } else {
            setError('Account created successfully! Please sign in to continue.')
            setTimeout(() => {
              router.push('/auth/signin?message=Account created successfully! Please sign in.')
            }, 2000)
          }
        } catch {
          setError('Account created successfully! Please sign in to continue.')
          setTimeout(() => {
            router.push('/auth/signin?message=Account created successfully! Please sign in.')
          }, 2000)
        }
      } else {
        setError(data.error || 'Failed to create account. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageSection className="min-h-[60vh] py-16 sm:py-20 bg-surface-0">
      <Container className="max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#FAFAFA] mb-2">Create your account</h1>
          <p className="text-white/50">Start your journey as a creator</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign up</CardTitle>
            <CardDescription>
              Create your account to start publishing content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Create a password (min 8 characters)"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-1">
                  Full name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-white/50">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-brand-400 hover:text-brand-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </PageSection>
  )
}
