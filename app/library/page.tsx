'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Disc3, ArrowRight } from 'lucide-react'

export default function LibraryPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function readNow(creatorSlug: string, intendedUrl?: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sso/reader', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorSlug, intendedUrl }) })
      if (!res.ok) throw new Error('Failed to create SSO link')
      const { authUrl } = await res.json()
      window.location.href = authUrl
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <section className="relative pt-40 pb-32 border-b border-white/[0.03] overflow-hidden">
        <Container className="relative z-10">
          <div className="max-w-4xl">
            <span className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-8 border border-white/10 px-3 py-1.5">
              Acquired Operations
            </span>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-heading font-bold text-[#FAFAFA] leading-[0.9] tracking-tight mb-8">
              Personal <br className="hidden md:block" />
              <span className="italic font-serif text-white/40">Library.</span>
            </h1>
            <p className="text-xl text-white/50 mb-12 max-w-2xl leading-relaxed">
              Archived transmissions ready for decryption. Select a payload to initiate the reader instance.
            </p>

            <div className="bg-white/[0.05] border border-white/[0.05] p-10 max-w-lg mt-16 group hover:border-brand-500/50 transition-colors">
              <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center">
                  <Disc3 className="w-5 h-5 text-white/40 group-hover:text-brand-400 transition-colors" />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-white/30">ID: DEMO-CREATOR</span>
              </div>

              <h3 className="font-heading text-3xl text-[#FAFAFA] mb-8">Demo Creator Archive</h3>

              <Button
                onClick={() => readNow('demo-creator')}
                disabled={loading}
                className="w-full h-14 rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 font-mono text-sm uppercase tracking-widest transition-colors flex justify-between items-center px-6"
              >
                {loading ? 'Decrypting...' : 'Initiate Reader'}
                <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
              </Button>

              {error && (
                <div className="mt-6 text-red-500 font-mono text-xs uppercase tracking-widest p-4 border border-red-500/20 bg-red-500/5">
                  [FAULT]: {error}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
