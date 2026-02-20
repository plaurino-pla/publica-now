'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Lock, LogIn, Sparkles, Globe, FileText } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeMethod, setActiveMethod] = useState<'credentials' | 'magic'>('credentials')
  const [isCheckingAuth, setIsCheckingAuth] = useState(false) // Temporarily disabled
  const [isEmailConfigured, setIsEmailConfigured] = useState(true) // Assume true initially
  const router = useRouter()

  // Check if email is configured
  useEffect(() => {
    const checkEmailConfig = async () => {
      try {
        const response = await fetch('/api/auth/email-config')
        if (response.ok) {
          const config = await response.json()
          setIsEmailConfigured(config.configured)
        }
      } catch (error) {
        console.log('Could not check email configuration')
        setIsEmailConfigured(false)
      }
    }
    
    checkEmailConfig()
  }, [])

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </Container>
      </PageSection>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const form = new FormData(e.currentTarget)
      const email = form.get('email') as string
      const password = form.get('password') as string
      
      const res = await signIn('credentials', { 
        email, 
        password, 
        redirect: false 
      })
      
      if (res?.ok) {
        router.push('/dashboard')
      } else {
        setError('Invalid credentials. Please check your email and password.')
      }
    } catch (error) {
      setError('An error occurred during sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function sendMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    if (!isEmailConfigured) {
      setError('Magic link authentication is not configured. Please use email and password instead.')
      setIsLoading(false)
      return
    }
    
    try {
      const form = new FormData(e.currentTarget)
      const email = form.get('magicEmail') as string
      const res = await signIn('email', { email, redirect: false })
      
      if (res?.ok) {
        setSuccess('Magic link sent! Check your email.')
        setError('')
      } else {
        setError('Failed to send magic link. Please try again.')
        setSuccess('')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      setSuccess('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageSection background="muted" className="min-h-[60vh] py-16 sm:py-20">
      <Container className="max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method Tabs */}
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveMethod('credentials')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeMethod === 'credentials'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => setActiveMethod('magic')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeMethod === 'magic'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                } ${!isEmailConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isEmailConfigured}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Magic Link
                {!isEmailConfigured && <span className="text-xs ml-1">(Unavailable)</span>}
              </button>
            </div>

            {/* Credentials Form */}
            {activeMethod === 'credentials' && (
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
                    placeholder="Enter your password"
                    className="w-full"
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            )}

            {/* Magic Link Form */}
            {activeMethod === 'magic' && (
              <form onSubmit={sendMagicLink} className="space-y-4">
                {!isEmailConfigured && (
                  <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded-md">
                    Magic link authentication is not configured. Please use email and password instead.
                  </div>
                )}
                <div>
                  <label htmlFor="magicEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <Input
                    id="magicEmail"
                    name="magicEmail"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full"
                    disabled={!isEmailConfigured}
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                    {success}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || !isEmailConfigured}>
                  {isLoading ? 'Sending...' : 'Send magic link'}
                </Button>
              </form>
            )}

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-brand-600 hover:text-brand-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </PageSection>
  )
}
