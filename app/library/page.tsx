'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

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
    <PageSection background="white">
      <Container className="space-y-4">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <p className="text-white/50">After a purchase, click Read Now to enter Publica Reader.</p>
        <div>
          <Button onClick={() => readNow('demo-creator')} disabled={loading}>{loading ? 'Opening…' : 'Read Now'}</Button>
        </div>
        {error && <div className="text-red-400">{error}</div>}
      </Container>
    </PageSection>
  )
}
