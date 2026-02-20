'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { User, Mail, Lock, PenTool, Globe, FileText } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(false) // Temporarily disabled
  const router = useRouter()

  // Temporarily disabled authentication check to prevent infinite loading
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await fetch('/api/auth/me')
  //       if (response.ok) {
  //         const userData = await response.json()
  //         if (userData.user) {
  //           router.push('/dashboard')
  //           return
  //         }
  //       }
  //       // If we get here, user is not authenticated - this is normal
  //       setIsCheckingAuth(false)
  //     } catch (error) {
  //       console.log('Auth check failed, user not logged in')
  //       setIsCheckingAuth(false)
  //     }
  //   }
    
  //   // Add a small delay to prevent rapid reloading
  //   const timer = setTimeout(checkAuth, 100)
  //   return () => clearTimeout(timer)
  // }, [router])

  if (isCheckingAuth) {
    return (
      <PageSection background="muted" className="min-h-[60vh] flex items-center">
        <Container className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </Container>
      </PageSection>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const form = new FormData(e.currentTarget)
      const email = form.get('email') as string
      const password = form.get('password') as string
      const name = form.get('name') as string
      const creatorName = form.get('creatorName') as string
      const creatorHandle = form.get('creatorHandle') as string
      const description = form.get('description') as string

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          creatorName: creatorName || undefined,
          creatorHandle: creatorHandle || undefined,
          description: description || '',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Sign up successful, now automatically sign in
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
            // Successfully signed in, redirect to dashboard
            router.push('/dashboard')
          } else {
            // Sign up worked but sign in failed, show success message and redirect to sign in
            setError('Account created successfully! Please sign in to continue.')
            setTimeout(() => {
              router.push('/auth/signin?message=Account created successfully! Please sign in.')
            }, 2000)
          }
        } catch (signInError) {
          console.error('Sign in error:', signInError)
          // Show success message and redirect to sign in
          setError('Account created successfully! Please sign in to continue.')
          setTimeout(() => {
            router.push('/auth/signin?message=Account created successfully! Please sign in.')
          }, 2000)
        }
      } else {
        setError(data.error || 'Failed to create account. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageSection background="muted" className="min-h-[60vh] py-16 sm:py-20">
      <Container className="max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Start your journey as a creator</p>
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Creator Profile (Optional)</h3>
                <p className="text-xs text-gray-500 mb-4">
                  You can set up your creator profile now or later
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="creatorName" className="block text-sm font-medium text-gray-700 mb-1">
                      Creator name
                    </label>
                    <Input
                      id="creatorName"
                      name="creatorName"
                      type="text"
                      placeholder="Your creator/brand name"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="creatorHandle" className="block text-sm font-medium text-gray-700 mb-1">
                      Creator handle
                    </label>
                    <Input
                      id="creatorHandle"
                      name="creatorHandle"
                      type="text"
                      placeholder="your-handle (lowercase, no spaces)"
                      pattern="[a-z0-9-]+"
                      title="Lowercase letters, numbers, and hyphens only"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Tell people about your content..."
                      rows={3}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
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
