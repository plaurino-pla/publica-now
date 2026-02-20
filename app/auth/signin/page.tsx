'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Container } from '@/components/ui/container'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeMethod, setActiveMethod] = useState<'credentials' | 'magic'>('credentials')
  const [isEmailConfigured, setIsEmailConfigured] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkEmailConfig = async () => {
      try {
        const response = await fetch('/api/auth/email-config')
        if (response.ok) {
          const config = await response.json()
          setIsEmailConfigured(config.configured)
        }
      } catch {
        setIsEmailConfigured(false)
      }
    }
    checkEmailConfig()
  }, [])

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
        setError('Invalid access credentials.')
      }
    } catch {
      setError('System error. Please retry.')
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
      setError('Magic link offline. Use credentials.')
      setIsLoading(false)
      return
    }

    try {
      const form = new FormData(e.currentTarget)
      const email = form.get('magicEmail') as string
      const res = await signIn('email', { email, redirect: false })

      if (res?.ok) {
        setSuccess('Transmission sent. Check inbox.')
        setError('')
      } else {
        setError('Transmission failed. Retry.')
        setSuccess('')
      }
    } catch {
      setError('System error. Please retry.')
      setSuccess('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-32 pb-24 flex items-center">
      <Container className="max-w-xl w-full">
        <div className="mb-16 border-b border-white/[0.05] pb-8">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-4 block">System Access</span>
          <h1 className="text-6xl sm:text-7xl font-heading font-bold text-[#FAFAFA] leading-none tracking-tight">
            Authenticate
          </h1>
        </div>

        <div className="bg-[#080808] border border-white/[0.05] p-8 sm:p-12 relative">
          {/* Method Tabs */}
          <div className="flex border-b border-white/[0.05] mb-10">
            <button
              type="button"
              onClick={() => setActiveMethod('credentials')}
              className={`flex-1 pb-4 text-xs font-mono uppercase tracking-widest transition-colors ${activeMethod === 'credentials'
                  ? 'border-b-2 border-brand-400 text-[#FAFAFA]'
                  : 'text-white/40 hover:text-white/70'
                }`}
            >
              Credentials
            </button>
            <button
              type="button"
              onClick={() => setActiveMethod('magic')}
              className={`flex-1 pb-4 text-xs font-mono uppercase tracking-widest transition-colors ${activeMethod === 'magic'
                  ? 'border-b-2 border-brand-400 text-[#FAFAFA]'
                  : 'text-white/40 hover:text-white/70'
                } ${!isEmailConfigured ? 'opacity-30 cursor-not-allowed' : ''}`}
              disabled={!isEmailConfigured}
            >
              Magic Link
            </button>
          </div>

          {/* Credentials Form */}
          {activeMethod === 'credentials' && (
            <form onSubmit={onSubmit} className="space-y-8">
              <div>
                <label htmlFor="email" className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-3">
                  Email Target
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter transmission address"
                  className="w-full bg-transparent border-white/10 rounded-none focus-visible:ring-1 focus-visible:ring-brand-400 h-14 text-lg"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-3">
                  Authorization Key
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter secure key"
                  className="w-full bg-transparent border-white/10 rounded-none focus-visible:ring-1 focus-visible:ring-brand-400 h-14 text-lg"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm font-mono p-4 border border-red-500/20 bg-red-500/5">
                  [ERROR]: {error}
                </div>
              )}

              <Button type="submit" className="w-full h-14 rounded-none text-base uppercase font-mono tracking-widest mt-4">
                {isLoading ? 'Processing...' : 'Access Files'}
              </Button>
            </form>
          )}

          {/* Magic Link Form */}
          {activeMethod === 'magic' && (
            <form onSubmit={sendMagicLink} className="space-y-8">
              {!isEmailConfigured && (
                <div className="text-brand-400 text-sm font-mono p-4 border border-brand-500/20 bg-brand-500/5 mb-6">
                  [OFFLINE]: Auth protocols down. Revert to credentials.
                </div>
              )}
              <div>
                <label htmlFor="magicEmail" className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-3">
                  Email Target
                </label>
                <Input
                  id="magicEmail"
                  name="magicEmail"
                  type="email"
                  required
                  placeholder="Enter transmission address"
                  className="w-full bg-transparent border-white/10 rounded-none focus-visible:ring-1 focus-visible:ring-brand-400 h-14 text-lg"
                  disabled={!isEmailConfigured}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm font-mono p-4 border border-red-500/20 bg-red-500/5">
                  [ERROR]: {error}
                </div>
              )}
              {success && (
                <div className="text-brand-400 text-sm font-mono p-4 border border-brand-500/20 bg-brand-500/5">
                  [SUCCESS]: {success}
                </div>
              )}

              <Button type="submit" className="w-full h-14 rounded-none text-base uppercase font-mono tracking-widest mt-4" disabled={isLoading || !isEmailConfigured}>
                {isLoading ? 'Transmitting...' : 'Send Uplink'}
              </Button>
            </form>
          )}

          <div className="mt-12 text-center border-t border-white/[0.05] pt-8">
            <p className="text-xs font-mono uppercase tracking-widest text-white/40">
              Unregistered entity?{' '}
              <Link href="/auth/signup" className="text-[#FAFAFA] border-b border-brand-400 hover:text-brand-400 pb-1 ml-2 transition-colors">
                Initiate Setup
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
