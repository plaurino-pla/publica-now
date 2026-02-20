'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, PenTool, Globe, Settings, ArrowRight, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

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
    { icon: CheckCircle, title: 'Account Created', description: 'Your creator account has been successfully created', status: 'completed' },
    { icon: PenTool, title: 'Create Your First Post', description: 'Start publishing content to build your audience', status: 'next' },
    { icon: Globe, title: 'Customize Your Profile', description: 'Add your bio, profile picture, and branding', status: 'upcoming' },
    { icon: Settings, title: 'Configure Publishing', description: 'Set up your Publica.la integration and payment settings', status: 'upcoming' }
  ]

  return (
    <PageSection background="muted">
      <Container className="max-w-4xl">
        <div className="text-center mb-12">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-brand-600 rounded-full flex items-center justify-center mb-6"><Sparkles className="h-8 w-8 text-white" /></div>
          <h1 className="text-4xl font-bold text-[#FAFAFA] mb-4">Welcome to Publica.now!</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">Your creator account has been successfully created. You're now ready to start building your audience and monetizing your content.</p>
          {creatorSlug && (<div className="mt-4 p-4 bg-surface-2 rounded-lg inline-block"><p className="text-sm text-white/50">Your creator URL:</p><p className="font-mono text-lg font-bold text-brand-400">{creatorSlug}.publica.now</p></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className={`relative ${step.status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/10' : ''}`}>
              <CardHeader><div className="flex items-center gap-3"><div className={`p-2 rounded-full ${step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : step.status === 'next' ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-3 text-white/40'}`}><step.icon className="w-5 h-5" /></div><div><CardTitle className="text-lg">{step.title}</CardTitle><CardDescription>{step.description}</CardDescription></div></div></CardHeader>
              {step.status === 'completed' && (<div className="absolute top-4 right-4"><CheckCircle className="w-6 h-6 text-emerald-400" /></div>)}
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:border-white/[0.15] transition-colors cursor-pointer"><CardContent className="p-6 text-center"><div className="w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><PenTool className="w-6 h-6 text-brand-400" /></div><h3 className="font-semibold text-[#FAFAFA] mb-2">Create Your First Post</h3><p className="text-sm text-white/50 mb-4">Start with a welcome post to introduce yourself to your audience</p><Button size="sm" className="w-full" onClick={() => router.push('/dashboard/new')}>Write Post</Button></CardContent></Card>
          <Card className="hover:border-white/[0.15] transition-colors cursor-pointer"><CardContent className="p-6 text-center"><div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Globe className="w-6 h-6 text-emerald-400" /></div><h3 className="font-semibold text-[#FAFAFA] mb-2">View Your Profile</h3><p className="text-sm text-white/50 mb-4">See how your creator profile looks to your audience</p><Button size="sm" variant="outline" className="w-full" onClick={() => router.push(`/${creatorSlug}`)}>View Profile</Button></CardContent></Card>
          <Card className="hover:border-white/[0.15] transition-colors cursor-pointer"><CardContent className="p-6 text-center"><div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Settings className="w-6 h-6 text-purple-400" /></div><h3 className="font-semibold text-[#FAFAFA] mb-2">Configure Settings</h3><p className="text-sm text-white/50 mb-4">Set up your payment methods and publishing preferences</p><Button size="sm" variant="outline" className="w-full" onClick={() => router.push('/dashboard/account')}>Settings</Button></CardContent></Card>
        </div>
        <Card className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-0"><CardContent className="p-8 text-center"><h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2><p className="text-brand-100 mb-6 max-w-2xl mx-auto">Your dashboard is ready with everything you need to start creating and publishing content. Let's begin your creator journey!</p><Button size="lg" className="bg-white text-brand-600 hover:bg-white/90" onClick={handleGetStarted}>Go to Dashboard<ArrowRight className="w-4 h-4 ml-2" /></Button></CardContent></Card>
        <div className="mt-12 text-center"><h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">Need Help Getting Started?</h3><div className="flex flex-col sm:flex-row gap-4 justify-center"><Link href="/how-it-works"><Button variant="outline">How It Works</Button></Link><Link href="/features"><Button variant="outline">Explore Features</Button></Link><Link href="/pricing"><Button variant="outline">View Pricing</Button></Link></div></div>
      </Container>
    </PageSection>
  )
}
