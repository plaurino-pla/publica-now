'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, PenTool, Globe, Settings, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'

export default function OnboardingPage() {
  const [creatorSlug, setCreatorSlug] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) { router.push('/auth/signin'); return }
        const userData = await response.json()
        if (!userData.user) { router.push('/auth/signin'); return }
        const params = new URLSearchParams(window.location.search)
        const slug = params.get('slug') || localStorage.getItem('creatorSlug')
        if (slug) setCreatorSlug(slug)
        else router.push('/dashboard')
      } catch (error) {
        router.push('/auth/signin')
      }
    }
    checkAuth()
  }, [router])

  const handleGetStarted = () => { router.push('/dashboard') }

  const steps = [
    { icon: Check, title: 'Entity Registered', description: 'System clearance is initiated.', status: 'completed' },
    { icon: PenTool, title: 'First Transmission', description: 'Deploy your introductory payload.', status: 'next' },
    { icon: Globe, title: 'Profile Config', description: 'Calibrate appearance settings.', status: 'upcoming' },
    { icon: Settings, title: 'Economics Config', description: 'Link financial processing paths.', status: 'upcoming' }
  ]

  return (
    <div className="min-h-screen bg-[#080808] pt-32 pb-24">
      <Container className="max-w-5xl">
        <div className="mb-24 border-b border-white/[0.05] pb-12 text-center md:text-left">
          <span className="inline-block uppercase tracking-[0.2em] text-xs font-mono text-white/40 mb-6 border border-white/10 px-3 py-1.5">
            Phase 01: Setup
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading text-[#FAFAFA] leading-[0.9] tracking-tight mb-8">
            Access <span className="italic font-serif text-white/40">Granted.</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
            Your clearance level is established. You are now authorized to initiate and monetize transmissions via PUBLICA.NOW.
          </p>
          {creatorSlug && (
            <div className="mt-8 border border-brand-500/20 bg-brand-500/5 p-4 inline-flex flex-col md:flex-row items-center gap-4">
              <p className="text-xs font-mono text-brand-400/60 uppercase tracking-widest">Target Endpoint:</p>
              <p className="font-mono text-lg text-brand-400 font-bold">{creatorSlug}.publica.now</p>
            </div>
          )}
        </div>

        <div className="mb-24">
          <h2 className="text-2xl font-heading text-[#FAFAFA] mb-8 pb-4 border-b border-white/[0.05]">Sequence Protocol</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05] border border-white/[0.05]">
            {steps.map((step, index) => (
              <div key={index} className={`relative p-8 md:p-10 bg-[#080808] transition-colors ${step.status === 'completed' ? 'bg-brand-500/5' : ''}`}>
                <div className="flex items-start gap-6">
                  <div className={`border h-12 w-12 flex items-center justify-center shrink-0 ${step.status === 'completed'
                      ? 'border-brand-500 text-brand-400'
                      : step.status === 'next'
                        ? 'border-white text-[#FAFAFA]'
                        : 'border-white/10 text-white/20'
                    }`}>
                    <step.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-heading mb-2 tracking-tight ${step.status === 'completed' ? 'text-brand-400' : 'text-[#FAFAFA]'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/40 font-mono tracking-wide leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05]">
          <div className="bg-[#080808] p-8 md:p-10 flex flex-col justify-between group">
            <div>
              <PenTool className="w-6 h-6 text-white/40 mb-8 group-hover:text-brand-400 transition-colors" />
              <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4">Draft Post</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-8">Execute your first transmission and define your narrative structure.</p>
            </div>
            <Button size="lg" className="w-full text-xs font-mono tracking-widest uppercase rounded-none h-14" onClick={() => router.push('/dashboard/new')}>Write File</Button>
          </div>

          <div className="bg-[#080808] p-8 md:p-10 flex flex-col justify-between group">
            <div>
              <Globe className="w-6 h-6 text-white/40 mb-8 group-hover:text-[#FAFAFA] transition-colors" />
              <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4">View Domain</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-8">Confirm how your public domain appears to unauthorized external users.</p>
            </div>
            <Button size="lg" className="w-full text-xs font-mono tracking-widest uppercase rounded-none h-14 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => router.push(`/${creatorSlug}`)}>Inspect Endpoint</Button>
          </div>

          <div className="bg-[#080808] p-8 md:p-10 flex flex-col justify-between group">
            <div>
              <Settings className="w-6 h-6 text-white/40 mb-8 group-hover:text-[#FAFAFA] transition-colors" />
              <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4">System Settings</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-8">Calibrate identity, integration endpoints, and overarching protocol rules.</p>
            </div>
            <Button size="lg" className="w-full text-xs font-mono tracking-widest uppercase rounded-none h-14 bg-white/[0.03] text-white hover:bg-white/[0.08]" onClick={() => router.push('/dashboard/account')}>Configure</Button>
          </div>
        </div>

        <div className="relative border border-white/[0.05] bg-[#080808] p-12 lg:p-16 overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-heading text-[#FAFAFA] mb-6">Proceed to Core Console.</h2>
            <p className="text-white/50 text-lg leading-relaxed mb-10">
              Your command center is active. All systems are operational. You may commence broadcasting at your discretion.
            </p>
            <Button size="lg" className="bg-[#FAFAFA] text-[#080808] hover:bg-white/90 rounded-none h-16 px-10 text-xs font-mono tracking-widest uppercase flex items-center justify-between min-w-[280px]" onClick={handleGetStarted}>
              Enter System <ArrowRight className="w-5 h-5 ml-4 opacity-50" />
            </Button>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        </div>

        <div className="mt-24 pt-12 border-t border-white/[0.05] text-center">
          <h3 className="text-xs font-mono tracking-widest uppercase text-white/40 mb-8">Support Documents</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/how-it-works" className="text-sm font-body text-white/60 hover:text-white transition-colors">Architecture Overview</Link>
            <span className="text-white/20 hidden sm:inline">•</span>
            <Link href="/pricing" className="text-sm font-body text-white/60 hover:text-white transition-colors">Economics Config</Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
