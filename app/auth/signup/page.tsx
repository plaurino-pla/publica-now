'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Container } from '@/components/ui/container'

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
            setError('Entity created. Re-authentication required.')
            setTimeout(() => {
              router.push('/auth/signin')
            }, 2000)
          }
        } catch {
          setError('Entity created. Re-authentication required.')
          setTimeout(() => {
            router.push('/auth/signin')
          }, 2000)
        }
      } else {
        setError(data.error || 'Setup failed. Aborting.')
      }
    } catch {
      setError('System error. Process aborted.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-32 pb-24 flex items-center">
      <Container className="max-w-xl w-full">
        <div className="mb-16 border-b border-white/[0.05] pb-8">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-4 block">New Entity Registration</span>
          <h1 className="text-6xl sm:text-7xl font-heading font-bold text-[#FAFAFA] leading-none tracking-tight">
            Initiate
          </h1>
        </div>

        <div className="bg-[#080808] border border-white/[0.05] p-8 sm:p-12 relative">
          <form onSubmit={onSubmit} className="space-y-8">
            <div>
              <label htmlFor="name" className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-3">
                Full Designation
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter full name"
                className="w-full bg-transparent border-white/10 rounded-none focus-visible:ring-1 focus-visible:ring-brand-400 h-14 text-lg"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-3">
                Target Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter email"
                className="w-full bg-transparent border-white/10 rounded-none focus-visible:ring-1 focus-visible:ring-brand-400 h-14 text-lg"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-3">
                Master Key
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Key must be 8+ characters"
                className="w-full bg-transparent border-white/10 rounded-none focus-visible:ring-1 focus-visible:ring-brand-400 h-14 text-lg"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm font-mono p-4 border border-red-500/20 bg-red-500/5">
                [ERROR]: {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-none text-base uppercase font-mono tracking-widest mt-4" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Deploy Instance'}
            </Button>
          </form>

          <div className="mt-12 text-center border-t border-white/[0.05] pt-8">
            <p className="text-xs font-mono uppercase tracking-widest text-white/40">
              Already allocated?{' '}
              <Link href="/auth/signin" className="text-[#FAFAFA] border-b border-brand-400 hover:text-brand-400 pb-1 ml-2 transition-colors">
                Access System
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
