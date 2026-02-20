import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { PenTool, Repeat, Share2, Disc3, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works - publica.now',
  description: 'Learn how publica.now makes it simple to go from idea to income in minutes. Four easy steps to publish, monetize, and grow your audience.',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 border-b border-white/[0.03] overflow-hidden">
        <Container className="relative z-10 text-center md:text-left">
          <div className="max-w-4xl">
            <span className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-8 border border-white/10 px-3 py-1.5">
              Operation Manual
            </span>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-heading font-bold text-[#FAFAFA] leading-[0.9] tracking-tight mb-8">
              Sequential <br className="hidden md:block" />
              <span className="italic font-serif text-white/40">Protocol.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl leading-relaxed">
              Ascending from draft to secure financial capture via four uncompromising stages. No bloat. No delays.
            </p>
            <Button asChild size="lg" className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-16 px-10 text-sm font-mono uppercase tracking-widest font-semibold group w-full sm:w-auto">
              <Link href="/auth/signup" aria-label="Start executing">
                Initiate Sequence <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Process Flow */}
      <section className="py-0 border-b border-white/[0.03]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05]">

          {/* Step 1: Amber */}
          <div className="bg-[#080808] p-10 md:p-12 group hover:bg-amber-500/[0.02] transition-colors relative border-t-2 border-transparent hover:border-amber-500/50">
            <span className="absolute top-10 right-10 font-mono text-xs text-amber-500/30 uppercase tracking-widest leading-none">Stage 01</span>
            <div className="w-16 h-16 mb-12 bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="font-heading text-3xl text-[#FAFAFA] mb-6 tracking-tight group-hover:text-amber-400 transition-colors">Draft & Inject</h3>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              Input source material into our distraction-free, Markdown-enabled command terminal. Attach raw media, configure tags, and define narrative vectors.
            </p>
            <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-4">
              <li className="flex gap-4"><span className="text-amber-400/50 shrink-0">::</span> Write via Markdown</li>
              <li className="flex gap-4"><span className="text-amber-400/50 shrink-0">::</span> Auto-Save Protocol</li>
              <li className="flex gap-4"><span className="text-amber-400/50 shrink-0">::</span> Multi-Media Embedding</li>
            </ul>
          </div>

          {/* Step 2: Emerald */}
          <div className="bg-[#080808] p-10 md:p-12 group hover:bg-emerald-500/[0.02] transition-colors relative border-t-2 border-transparent hover:border-emerald-500/50">
            <span className="absolute top-10 right-10 font-mono text-xs text-emerald-500/30 uppercase tracking-widest leading-none">Stage 02</span>
            <div className="w-16 h-16 mb-12 bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
              <Repeat className="w-6 h-6 text-emerald-500/60 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="font-heading text-3xl text-[#FAFAFA] mb-6 tracking-tight group-hover:text-emerald-400 transition-colors">Process & Encode</h3>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              Execute compilation. The system ingests raw drafts and autonomously transpiles into high-fidelity EPUB and isolated audio streaming outputs.
            </p>
            <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-4">
              <li className="flex gap-4"><span className="text-emerald-400/50 shrink-0">::</span> One-Click Compile</li>
              <li className="flex gap-4"><span className="text-emerald-400/50 shrink-0">::</span> EPUB Rendering</li>
              <li className="flex gap-4"><span className="text-emerald-400/50 shrink-0">::</span> Automated Pagination</li>
            </ul>
          </div>

          {/* Step 3: Purple */}
          <div className="bg-[#080808] p-10 md:p-12 group hover:bg-purple-500/[0.02] transition-colors relative border-t-2 border-transparent hover:border-purple-500/50">
            <span className="absolute top-10 right-10 font-mono text-xs text-purple-500/30 uppercase tracking-widest leading-none">Stage 03</span>
            <div className="w-16 h-16 mb-12 bg-purple-500/5 border border-purple-500/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-purple-500/60 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="font-heading text-3xl text-[#FAFAFA] mb-6 tracking-tight group-hover:text-purple-400 transition-colors">Broadcast Stream</h3>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              Your customized domain is propelled worldwide across our CDN. Secure routing ensures high availability and aesthetic fidelity regardless of client device.
            </p>
            <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-4">
              <li className="flex gap-4"><span className="text-purple-400/50 shrink-0">::</span> CDN Distribution</li>
              <li className="flex gap-4"><span className="text-purple-400/50 shrink-0">::</span> Variable Tethers</li>
              <li className="flex gap-4"><span className="text-purple-400/50 shrink-0">::</span> Responsive Nodes</li>
            </ul>
          </div>

          {/* Step 4: Vermilion */}
          <div className="bg-[#080808] p-10 md:p-12 group hover:bg-brand-500/[0.02] transition-colors relative border-t-2 border-transparent hover:border-brand-500/50">
            <span className="absolute top-10 right-10 font-mono text-xs text-brand-500/30 uppercase tracking-widest leading-none">Stage 04</span>
            <div className="w-16 h-16 mb-12 bg-brand-500/5 border border-brand-500/20 flex items-center justify-center">
              <Disc3 className="w-6 h-6 text-brand-500/60 group-hover:text-brand-400 transition-colors" />
            </div>
            <h3 className="font-heading text-3xl text-[#FAFAFA] mb-6 tracking-tight group-hover:text-brand-400 transition-colors">Capture Revenue</h3>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              Engage monetization arrays. Enforce subscription logic or single-use decryption keys. Keep 85% of all intercepted capital.
            </p>
            <ul className="text-white/30 font-mono text-xs uppercase tracking-widest space-y-4">
              <li className="flex gap-4"><span className="text-brand-400/50 shrink-0">::</span> Secure Stripe Hooks</li>
              <li className="flex gap-4"><span className="text-brand-400/50 shrink-0">::</span> 85% Value Capture</li>
              <li className="flex gap-4"><span className="text-brand-400/50 shrink-0">::</span> Instant Liquidity</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Timeline Specifications */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03]">
        <Container>
          <div className="mb-20">
            <span className="font-mono text-xs text-white/30 uppercase tracking-widest block mb-4">Operations Telemetry</span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#FAFAFA]">Time to Execution</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05]">
            <div className="bg-[#080808] p-12 text-center group">
              <div className="text-6xl sm:text-7xl font-heading text-white/20 mb-6 group-hover:text-white transition-colors">T+05</div>
              <h3 className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 group-hover:text-brand-400 transition-colors">Minutes</h3>
              <p className="text-white/50">Complete instance creation & logic mapping</p>
            </div>
            <div className="bg-[#080808] p-12 text-center group">
              <div className="text-6xl sm:text-7xl font-heading text-white/20 mb-6 group-hover:text-white transition-colors">T+15</div>
              <h3 className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2 group-hover:text-brand-400 transition-colors">Minutes</h3>
              <p className="text-white/50">First payload successfully deployed & encoded</p>
            </div>
            <div className="bg-[#080808] p-12 text-center group">
              <div className="text-6xl sm:text-7xl font-heading text-brand-400 mb-6 drop-shadow-[0_0_15px_rgba(255,87,34,0.3)]">Now</div>
              <h3 className="font-mono text-sm tracking-widest uppercase text-white/40 mb-2">Live Revenue</h3>
              <p className="text-white/50">Instance active and processing inbound capital</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative group">
        <Container className="text-center relative z-10">
          <span className="font-mono text-xs text-brand-400 uppercase tracking-widest block mb-6 px-3 py-1 border border-brand-500/20 bg-brand-500/5 w-max mx-auto">
            Ready State Achieved
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading text-[#FAFAFA] mb-12 tracking-tight">
            Commence <span className="italic text-white/40">Operation.</span>
          </h2>
          <Button
            asChild
            size="lg"
            className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-16 px-12 text-sm font-mono tracking-widest uppercase font-semibold mx-auto border-none"
          >
            <Link href="/auth/signup">
              Access Terminal <ArrowRight className="ml-4 w-5 h-5" />
            </Link>
          </Button>
        </Container>
      </section>
    </div>
  )
}
