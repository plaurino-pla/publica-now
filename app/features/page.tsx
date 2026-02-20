import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

export const metadata: Metadata = {
  title: 'Features - publica.now',
  description: 'Discover the powerful features that make publica.now the perfect platform for independent creators to publish and monetize content.',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <PageSection background="muted">
        <Container className="text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-[#FAFAFA] mb-6">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-600"> Succeed</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 mb-8 max-w-3xl mx-auto">
            Professional publishing tools built for independent creators, powered by enterprise-grade infrastructure.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 glow-brand hover:from-brand-700 hover:to-indigo-700 transition-all duration-300">
            <Link href="/dashboard/new" aria-label="Start publishing">Start Publishing</Link>
          </Button>
        </Container>
      </PageSection>

      {/* Core Features */}
      <PageSection background="white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-6">Core Publishing Features</h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">Everything you need to create, publish, and monetize your content</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature cards unchanged markup */}
            <div className="p-8 rounded-2xl border border-white/[0.06] hover:border-brand-500/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-brand-500/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"><span className="text-2xl">✍️</span></div>
              <h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-4">Rich Text Editor</h3>
              <p className="text-white/50 mb-4">Professional editor with Markdown support, formatting tools, and real-time preview.</p>
              <ul className="text-white/50 text-sm space-y-2"><li>• Headings, lists, and formatting</li><li>• Image and link embedding</li><li>• Draft saving and versioning</li></ul>
            </div>
            <div className="p-8 rounded-2xl border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"><span className="text-2xl">🔄</span></div>
              <h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-4">Auto-Conversion</h3>
              <p className="text-white/50 mb-4">Your content automatically converts to professional EPUB and audio formats.</p>
              <ul className="text-white/50 text-sm space-y-2"><li>• EPUB generation</li><li>• Audio conversion</li><li>• Professional formatting</li></ul>
            </div>
            <div className="p-8 rounded-2xl border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-purple-500/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"><span className="text-2xl">🏪</span></div>
              <h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-4">Auto-Generated Storefront</h3>
              <p className="text-white/50 mb-4">Beautiful creator pages built automatically with your branding and content.</p>
              <ul className="text-white/50 text-sm space-y-2"><li>• Custom URLs</li><li>• Branded themes</li><li>• Content organization</li></ul>
            </div>
            <div className="p-8 rounded-2xl border border-white/[0.06] hover:border-orange-500/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-orange-500/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"><span className="text-2xl">💳</span></div>
              <h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-4">Payment Processing</h3>
              <p className="text-white/50 mb-4">Professional payment infrastructure with global reach and security.</p>
              <ul className="text-white/50 text-sm space-y-2"><li>• Multi-currency support</li><li>• Secure transactions</li><li>• Instant payouts</li></ul>
            </div>
            <div className="p-8 rounded-2xl border border-white/[0.06] hover:border-red-500/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-500/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"><span className="text-2xl">📊</span></div>
              <h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-4">Analytics Dashboard</h3>
              <p className="text-white/50 mb-4">Track your performance with detailed insights and metrics.</p>
              <ul className="text-white/50 text-sm space-y-2"><li>• Sales analytics</li><li>• Audience insights</li><li>• Performance tracking</li></ul>
            </div>
            <div className="p-8 rounded-2xl border border-white/[0.06] hover:border-teal-500/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-teal-500/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"><span className="text-2xl">🔒</span></div>
              <h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-4">Access Control</h3>
              <p className="text-white/50 mb-4">Flexible content gating and subscription management.</p>
              <ul className="text-white/50 text-sm space-y-2"><li>• Free previews</li><li>• Subscription tiers</li><li>• Content protection</li></ul>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* Monetization Features */}
      <PageSection background="muted">
        <Container>
          <div className="text-center mb-16"><h2 className="font-heading text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-6">Monetization Options</h2><p className="text-xl text-white/50 max-w-2xl mx-auto">Multiple ways to turn your content into revenue</p></div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-surface-1 p-8 rounded-2xl border border-white/[0.06]">
              <div className="text-center mb-6"><div className="w-20 h-20 bg-brand-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-3xl">📅</span></div><h3 className="font-heading text-2xl font-bold text-[#FAFAFA] mb-3">Subscription Plans</h3></div>
              <ul className="text-white/50 space-y-3"><li>• Monthly and annual billing</li><li>• Multiple subscription tiers</li><li>• Automatic renewals</li><li>• Prorated upgrades/downgrades</li><li>• Free trial periods</li></ul>
            </div>
            <div className="bg-surface-1 p-8 rounded-2xl border border-white/[0.06]">
              <div className="text-center mb-6"><div className="w-20 h-20 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🛒</span></div><h3 className="font-heading text-2xl font-bold text-[#FAFAFA] mb-3">One-Time Sales</h3></div>
              <ul className="text-white/50 space-y-3"><li>• Individual content sales</li><li>• Bundle pricing</li><li>• Discount codes</li><li>• Limited-time offers</li><li>• Gift purchases</li></ul>
            </div>
          </div>
        </Container>
      </PageSection>

      {/* Infrastructure Features */}
      <PageSection background="white">
        <Container>
          <div className="text-center mb-16"><h2 className="font-heading text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-6">Enterprise-Grade Infrastructure</h2><p className="text-xl text-white/50 max-w-2xl mx-auto">Built on Publica.la's battle-tested platform for reliability and scale</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6"><div className="w-16 h-16 bg-brand-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🌍</span></div><h3 className="font-heading text-lg font-bold text-[#FAFAFA] mb-2">Global Distribution</h3><p className="text-white/50 text-sm">CDN-powered content delivery worldwide</p></div>
            <div className="text-center p-6"><div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🔐</span></div><h3 className="font-heading text-lg font-bold text-[#FAFAFA] mb-2">DRM Protection</h3><p className="text-white/50 text-sm">Professional content security and protection</p></div>
            <div className="text-center p-6"><div className="w-16 h-16 bg-purple-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">📱</span></div><h3 className="font-heading text-lg font-bold text-[#FAFAFA] mb-2">Cross-Platform</h3><p className="text-white/50 text-sm">Works on all devices and platforms</p></div>
            <div className="text-center p-6"><div className="w-16 h-16 bg-orange-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">⚡</span></div><h3 className="font-heading text-lg font-bold text-[#FAFAFA] mb-2">High Performance</h3><p className="text-white/50 text-sm">Optimized for speed and reliability</p></div>
          </div>
        </Container>
      </PageSection>

      {/* CTA Section */}
      <PageSection background="brand">
        <Container className="text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-brand-400 mb-8 max-w-2xl mx-auto">Join thousands of creators who are already publishing and earning with publica.now</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-4 bg-white text-brand-600 hover:bg-surface-2 transition-all duration-300"><Link href="/dashboard/new" aria-label="Start publishing">Start Publishing</Link></Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-brand-600 transition-all duration-300"><Link href="/how-it-works">Learn More</Link></Button>
          </div>
        </Container>
      </PageSection>
    </div>
  )
}
