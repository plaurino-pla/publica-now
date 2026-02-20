import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { PenTool, Repeat, LayoutTemplate, CreditCard, Activity, Lock, ArrowRight, Upload, Globe, Shield, Smartphone, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features - publica.now',
  description: 'Discover the powerful features that make publica.now the perfect platform for independent creators to publish and monetize content.',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 border-b border-white/[0.03] overflow-hidden">
        <Container className="relative z-10 text-center md:text-left">
          <div className="max-w-4xl">
            <span className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-8 border border-white/10 px-3 py-1.5">
              System Capabilities
            </span>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-heading font-bold text-[#FAFAFA] leading-[0.9] tracking-tight mb-8">
              Everything required to <br className="hidden md:block" />
              <span className="italic font-serif text-white/40">transmit & scale.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl leading-relaxed">
              Professional publishing tools built for independent creators, powered by robust infrastructure and uncompromising economics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <Button asChild size="lg" className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-16 px-10 text-sm font-mono uppercase tracking-widest font-semibold group w-full sm:w-auto">
                <Link href="/auth/signup" aria-label="Start publishing">
                  Deploy Instance <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Features Matrix */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03]">
        <Container>
          <div className="mb-16 border-b border-white/[0.05] pb-10">
            <h2 className="text-4xl sm:text-5xl font-heading text-[#FAFAFA] tracking-tight">Core Architecture</h2>
            <p className="text-white/40 mt-4 text-lg">Primary modules included in your deployment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05]">
            {/* Feature 1: Amber */}
            <div className="bg-[#080808] p-10 group hover:bg-amber-500/[0.02] transition-colors border-t-2 border-transparent hover:border-amber-500/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 mb-10 bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
                </div>
                <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4 group-hover:text-amber-400 transition-colors">Rich Text Editor</h3>
                <p className="text-white/50 mb-8 leading-relaxed">Professional editor with Markdown support, formatting tools, and real-time rendering precision.</p>
              </div>
              <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-3">
                <li className="flex gap-3"><span className="text-amber-400/50">+</span> Headings & Formatting</li>
                <li className="flex gap-3"><span className="text-amber-400/50">+</span> Media Embedding</li>
                <li className="flex gap-3"><span className="text-amber-400/50">+</span> Version History</li>
              </ul>
            </div>

            {/* Feature 2: Emerald */}
            <div className="bg-[#080808] p-10 group hover:bg-emerald-500/[0.02] transition-colors border-t-2 border-transparent hover:border-emerald-500/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 mb-10 bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-emerald-500/60 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4 group-hover:text-emerald-400 transition-colors">Auto-Conversion</h3>
                <p className="text-white/50 mb-8 leading-relaxed">Your content pipeline automatically outputs to professional EPUB and audio streaming formats.</p>
              </div>
              <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-3">
                <li className="flex gap-3"><span className="text-emerald-400/50">+</span> EPUB Generation</li>
                <li className="flex gap-3"><span className="text-emerald-400/50">+</span> Audio Encoding</li>
                <li className="flex gap-3"><span className="text-emerald-400/50">+</span> Metadata Injection</li>
              </ul>
            </div>

            {/* Feature 3: Purple */}
            <div className="bg-[#080808] p-10 group hover:bg-purple-500/[0.02] transition-colors border-t-2 border-transparent hover:border-purple-500/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 mb-10 bg-purple-500/5 border border-purple-500/20 flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5 text-purple-500/60 group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4 group-hover:text-purple-400 transition-colors">Dynamic Storefront</h3>
                <p className="text-white/50 mb-8 leading-relaxed">System-generated creator endpoints built instantly with your branding variables and archive.</p>
              </div>
              <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-3">
                <li className="flex gap-3"><span className="text-purple-400/50">+</span> Domain Routing</li>
                <li className="flex gap-3"><span className="text-purple-400/50">+</span> Brand Variables</li>
                <li className="flex gap-3"><span className="text-purple-400/50">+</span> Archive Indexing</li>
              </ul>
            </div>

            {/* Feature 4: Brand/Vermilion */}
            <div className="bg-[#080808] p-10 group hover:bg-brand-500/[0.02] transition-colors border-b-2 border-transparent hover:border-brand-500/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 mb-10 bg-brand-500/5 border border-brand-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-brand-500/60 group-hover:text-brand-400 transition-colors" />
                </div>
                <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4 group-hover:text-brand-400 transition-colors">Payment Gateway</h3>
                <p className="text-white/50 mb-8 leading-relaxed">Integrated Stripe financial routing offering global reach and 85% creator retention.</p>
              </div>
              <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-3">
                <li className="flex gap-3"><span className="text-brand-400/50">+</span> Multi-Currency</li>
                <li className="flex gap-3"><span className="text-brand-400/50">+</span> Stripe Connect</li>
                <li className="flex gap-3"><span className="text-brand-400/50">+</span> Direct Payouts</li>
              </ul>
            </div>

            {/* Feature 5: Teal/Blue */}
            <div className="bg-[#080808] p-10 group hover:bg-blue-500/[0.02] transition-colors border-b-2 border-transparent hover:border-blue-500/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 mb-10 bg-blue-500/5 border border-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-500/60 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4 group-hover:text-blue-400 transition-colors">Telemetry & Analytics</h3>
                <p className="text-white/50 mb-8 leading-relaxed">High-fidelity metrics tracking transaction volume, retention, and network performance.</p>
              </div>
              <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-3">
                <li className="flex gap-3"><span className="text-blue-400/50">+</span> Revenue Trajectory</li>
                <li className="flex gap-3"><span className="text-blue-400/50">+</span> Client Insights</li>
                <li className="flex gap-3"><span className="text-blue-400/50">+</span> Interaction Logs</li>
              </ul>
            </div>

            {/* Feature 6: Indigo/Slate */}
            <div className="bg-[#080808] p-10 group hover:bg-indigo-500/[0.02] transition-colors border-b-2 border-transparent hover:border-indigo-500/50 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 mb-10 bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-indigo-500/60 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="font-heading text-2xl text-[#FAFAFA] mb-4 group-hover:text-indigo-400 transition-colors">Access Controls</h3>
                <p className="text-white/50 mb-8 leading-relaxed">Granular firewalling. You define the exact parameters for free versus paid decryption.</p>
              </div>
              <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-3">
                <li className="flex gap-3"><span className="text-indigo-400/50">+</span> Paywall Injectors</li>
                <li className="flex gap-3"><span className="text-indigo-400/50">+</span> Tier Exceptions</li>
                <li className="flex gap-3"><span className="text-indigo-400/50">+</span> Payload Security</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Monetization Models */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03]">
        <Container>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 border-b border-white/[0.05] pb-10 gap-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 block mb-4">Economic Engines</span>
              <h2 className="text-4xl sm:text-5xl font-heading text-[#FAFAFA] tracking-tight">Monetization Structuring</h2>
            </div>
            <p className="text-white/50 max-w-sm text-lg md:text-right leading-relaxed">
              Define the financial rules governing access to your domain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-px md:bg-white/[0.05]">
            <div className="bg-[#080808] p-10 md:p-16 border border-white/[0.05] md:border-none relative group">
              <span className="absolute top-10 right-10 font-mono text-xs text-brand-400 uppercase tracking-widest border border-brand-500/20 bg-brand-500/5 px-3 py-1">Recurring</span>
              <h3 className="font-heading text-4xl text-[#FAFAFA] mb-6 mt-12">Subscription Plans</h3>
              <ul className="space-y-4 font-mono text-sm tracking-widest uppercase text-white/40 mt-10">
                <li className="flex items-center gap-4"><span className="h-px w-6 bg-white/20"></span> Monthly & Annual Cadence</li>
                <li className="flex items-center gap-4"><span className="h-px w-6 bg-white/20"></span> Multi-Tier Access</li>
                <li className="flex items-center gap-4"><span className="h-px w-6 bg-white/20"></span> Automated Renewals</li>
                <li className="flex items-center gap-4"><span className="h-px w-6 bg-white/20"></span> Trial Period Config</li>
              </ul>
            </div>

            <div className="bg-[#080808] p-10 md:p-16 border border-white/[0.05] md:border-none relative group">
              <span className="absolute top-10 right-10 font-mono text-xs text-emerald-400 uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">Direct</span>
              <h3 className="font-heading text-4xl text-[#FAFAFA] mb-6 mt-12">Linear Transactions</h3>
              <ul className="space-y-4 font-mono text-sm tracking-widest uppercase text-white/40 mt-10">
                <li className="flex items-center gap-4"><span className="h-px w-6 bg-white/20"></span> Isolated File Sales</li>
                <li className="flex items-center gap-4"><span className="h-px w-6 bg-white/20"></span> Bundle Packaging</li>
                <li className="flex items-center gap-4"><span className="h-px w-6 bg-white/20"></span> Arbitrage / Discounts</li>
                <li className="flex items-center gap-4"><span className="h-px w-6 bg-white/20"></span> Gift Routing</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Infrastructure Specs */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03]">
        <Container>
          <div className="mb-24 pt-10 border-t border-white/[0.05]">
            <span className="font-mono text-xs text-white/30 uppercase tracking-widest">Global Framework Specifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div>
              <Globe className="w-8 h-8 text-white/30 mb-6" strokeWidth={1} />
              <h3 className="font-heading text-xl text-[#FAFAFA] mb-3">Global Routing</h3>
              <p className="text-white/40 text-sm leading-relaxed">CDN-powered content delivery mirroring your payload worldwide instantly.</p>
            </div>
            <div>
              <Shield className="w-8 h-8 text-white/30 mb-6" strokeWidth={1} />
              <h3 className="font-heading text-xl text-[#FAFAFA] mb-3">DRM Encryption</h3>
              <p className="text-white/40 text-sm leading-relaxed">Advanced file security restricting unauthorized hardware distribution.</p>
            </div>
            <div>
              <Smartphone className="w-8 h-8 text-white/30 mb-6" strokeWidth={1} />
              <h3 className="font-heading text-xl text-[#FAFAFA] mb-3">Agnostic Format</h3>
              <p className="text-white/40 text-sm leading-relaxed">Fluid scaling and rendering across mobile, desktop, and embedded readers.</p>
            </div>
            <div>
              <Zap className="w-8 h-8 text-white/30 mb-6" strokeWidth={1} />
              <h3 className="font-heading text-xl text-[#FAFAFA] mb-3">High Velocity</h3>
              <p className="text-white/40 text-sm leading-relaxed">Optimized response times bypassing traditional heavy frontend bloat.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative group border-b border-brand-500/30">
        <Container className="text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-[#FAFAFA] mb-12 tracking-tight">
            Initiate your <span className="italic text-white/40 text-brand-400">Environment.</span>
          </h2>
          <Button
            asChild
            size="lg"
            className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-16 px-12 text-sm font-mono tracking-widest uppercase font-semibold mx-auto border-none"
          >
            <Link href="/auth/signup">
              Deploy Instance <ArrowRight className="ml-4 w-5 h-5" />
            </Link>
          </Button>
        </Container>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-brand-500/10 to-transparent pointer-events-none" />
      </section>
    </div>
  )
}
