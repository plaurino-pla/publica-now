import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

export const metadata: Metadata = {
  title: 'How It Works - publica.now',
  description: 'Learn how publica.now makes it simple to go from idea to income in minutes. Four easy steps to publish, monetize, and grow your audience.',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <PageSection background="muted">
        <Container className="text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-[#FAFAFA] mb-6">How It Works</h1>
          <p className="text-xl md:text-2xl text-white/50 mb-8 max-w-3xl mx-auto">From idea to income in four simple steps. No complex setup, no waiting periods.</p>
          <Button asChild size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 glow-brand hover:from-brand-600 hover:to-brand-700 hover:shadow-xl transition-all duration-300"><Link href="/dashboard/new">Get Started Now</Link></Button>
        </Container>
      </PageSection>

      {/* Step-by-Step Process */}
      <PageSection background="white">
        <Container>
          <div className="text-center mb-16"><h2 className="font-heading text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-6">The Complete Journey</h2><p className="text-xl text-white/50 max-w-2xl mx-auto">See how creators go from writing to earning in minutes</p></div>
          <div className="max-w-6xl mx-auto">
            {/* Steps unchanged, only containerized */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20"><div className="order-2 md:order-1"><div className="flex items-center mb-6"><div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">1</div><h3 className="font-heading text-3xl font-bold text-[#FAFAFA]">Write & Create</h3></div><p className="text-lg text-white/50 mb-6">Start with our intuitive, Substack-style editor. Write your content with rich formatting, add images, and organize your thoughts. Everything saves automatically as you work.</p><ul className="text-white/50 space-y-3"><li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Rich text editor with Markdown support</li><li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Real-time preview and formatting</li><li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Automatic draft saving</li><li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Cover image and tag management</li></ul></div><div className="order-1 md:order-2 text-center"><div className="w-80 h-80 bg-gradient-to-br from-brand-500/15 to-indigo-500/15 rounded-3xl flex items-center justify-center mx-auto"><span className="text-8xl">✍️</span></div></div></div>
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20"><div className="text-center"><div className="w-80 h-80 bg-gradient-to-br from-emerald-500/15 to-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto"><span className="text-8xl">🔄</span></div></div><div><div className="flex items-center mb-6"><div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">2</div><h3 className="font-heading text-3xl font-bold text-[#FAFAFA]">Publish & Convert</h3></div><p className="text-lg text-white/50 mb-6">Click publish and watch the magic happen. Your content automatically converts to professional EPUB and audio formats, ready for distribution worldwide.</p><ul className="text-white/50 space-y-3"><li className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>One-click publishing</li><li className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>Automatic EPUB generation</li><li className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>Professional formatting</li><li className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>Cover image embedding</li></ul></div></div>
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20"><div className="order-2 md:order-1"><div className="flex items-center mb-6"><div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">3</div><h3 className="font-heading text-3xl font-bold text-[#FAFAFA]">Share & Engage</h3></div><p className="text-lg text-white/50 mb-6">Your content gets a beautiful, branded creator page automatically. Share it with your audience, and they can read, listen, and engage with your work seamlessly.</p><ul className="text-white/50 space-y-3"><li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>Auto-generated creator pages</li><li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>Custom branding and themes</li><li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>Mobile-optimized experience</li><li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>Social sharing integration</li></ul></div><div className="order-1 md:order-2 text-center"><div className="w-80 h-80 bg-gradient-to-br from-purple-500/15 to-pink-500/10 rounded-3xl flex items-center justify-center mx-auto"><span className="text-8xl">📱</span></div></div></div>
            <div className="grid md:grid-cols-2 gap-12 items-center"><div className="text-center"><div className="w-80 h-80 bg-gradient-to-br from-orange-500/15 to-red-500/10 rounded-3xl flex items-center justify-center mx-auto"><span className="text-8xl">💰</span></div></div><div><div className="flex items-center mb-6"><div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">4</div><h3 className="font-heading text-3xl font-bold text-[#FAFAFA]">Monetize & Grow</h3></div><p className="text-lg text-white/50 mb-6">Start earning immediately with flexible monetization options. Choose between subscriptions, one-time sales, or free content to build your audience.</p><ul className="text-white/50 space-y-3"><li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Subscription plans</li><li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>One-time purchases</li><li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Instant payouts</li><li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Audience analytics</li></ul></div></div>
          </div>
        </Container>
      </PageSection>

      {/* Timeline Section */}
      <PageSection background="muted">
        <Container>
          <div className="text-center mb-16"><h2 className="font-heading text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-6">Timeline to Success</h2><p className="text-xl text-white/50 max-w-2xl mx-auto">See how quickly you can go from zero to published</p></div>
          <div className="max-w-4xl mx-auto"><div className="grid md:grid-cols-3 gap-8"><div className="text-center p-6"><div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">5</div><h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-2">Minutes</h3><p className="text-white/50">Sign up and create your creator space</p></div><div className="text-center p-6"><div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">15</div><h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-2">Minutes</h3><p className="text-white/50">Write and publish your first piece</p></div><div className="text-center p-6"><div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">Now</div><h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-2">Start Earning</h3><p className="text-white/50">Your content is live and monetizable</p></div></div></div>
        </Container>
      </PageSection>

      {/* Why Choose Publica.now */}
      <PageSection background="white">
        <Container>
          <div className="text-center mb-16"><h2 className="font-heading text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-6">Why Choose Publica.now?</h2><p className="text-xl text-white/50 max-w-2xl mx-auto">Built on enterprise-grade infrastructure, designed for independent creators</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'From signup to publishing in under 20 minutes. No waiting, no approval processes.' },
              { icon: '🔒', title: 'Secure & Reliable', desc: "Built on Publica.la's battle-tested infrastructure with enterprise-grade security." },
              { icon: '🌍', title: 'Global Reach', desc: 'Reach readers worldwide with multi-currency support and global distribution.' },
              { icon: '📊', title: 'Smart Analytics', desc: 'Track performance, understand your audience, and optimize for growth.' },
              { icon: '🎨', title: 'Customizable', desc: 'Brand your storefront, customize themes, and make it uniquely yours.' },
              { icon: '💎', title: 'Premium Quality', desc: 'Professional-grade tools without the enterprise complexity or cost.' },
            ].map((f) => (
              <div key={f.title} className="text-center p-6"><div className="w-16 h-16 bg-brand-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">{f.icon}</span></div><h3 className="font-heading text-xl font-bold text-[#FAFAFA] mb-3">{f.title}</h3><p className="text-white/50">{f.desc}</p></div>
            ))}
          </div>
        </Container>
      </PageSection>

      {/* CTA Section */}
      <PageSection background="brand">
        <Container className="text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">Join thousands of creators who are already publishing and earning with publica.now</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-4 bg-white text-[#0a0a0a] hover:bg-white/90 hover:shadow-xl transition-all duration-300"><Link href="/dashboard/new" aria-label="Start publishing">Start Publishing</Link></Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-brand-600 transition-all duration-300"><Link href="/features">View Features</Link></Button>
          </div>
        </Container>
      </PageSection>
    </div>
  )
}
