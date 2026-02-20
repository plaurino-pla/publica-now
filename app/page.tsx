import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import {
  FileText,
  Mic,
  Image as ImageIcon,
  Video,
  Upload,
  Share2,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080808] selection:bg-brand-500/30">
      <div className="noise" aria-hidden="true" />

      {/* ══════════════════════════════════════════════════
          HERO — Oversized stat + editorial typography
          ══════════════════════════════════════════════════ */}
      <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32 overflow-hidden border-b border-white/[0.03]">
        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
            {/* Left: Main headline */}
            <div className="lg:col-span-7 lg:pr-12">
              <span className="inline-block uppercase tracking-[0.25em] text-[10px] font-mono text-brand-400 mb-10 border border-brand-500/20 bg-brand-500/5 px-4 py-2">
                The new creator standard
              </span>
              <h1 className="text-[clamp(3rem,8vw,8rem)] font-heading text-[#F2F2F0] leading-[0.85] tracking-tight mb-10">
                Monetize<br />
                <span className="italic text-white/30 font-serif">without</span>{' '}
                friction.
              </h1>
              <p className="text-lg sm:text-xl text-white/50 leading-relaxed mb-10 max-w-lg">
                A radically simple platform to publish and sell text, audio, images, and video — then keep <strong className="text-[#FAFAFA] font-semibold">85%</strong> of everything you earn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-16 px-10 text-sm font-mono uppercase tracking-widest font-semibold group"
                >
                  <Link href="/auth/signup">
                    Start publishing free
                    <ArrowUpRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-none h-16 px-10 text-sm font-mono uppercase tracking-widest border-white/10 text-white/60 hover:text-white hover:border-white/30"
                >
                  <Link href="/how-it-works">
                    See how it works
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Giant "85%" stat */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative">
              <div className="relative">
                <span className="text-[clamp(8rem,20vw,16rem)] font-heading text-white/[0.04] leading-none tracking-tighter select-none">
                  85
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-7xl sm:text-8xl md:text-9xl font-heading text-brand-400 leading-none tracking-tighter drop-shadow-[0_0_60px_rgba(255,87,34,0.3)]">
                      85%
                    </span>
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mt-4">
                      Revenue retained
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Hero background blurs */}
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-brand-500/[0.04] rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/[0.03] rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/3" />
      </section>

      {/* ══════════════════════════════════════════════════
          MARQUEE TICKER — Infinite scroll trust signals
          ══════════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.03] bg-white/[0.01] overflow-hidden py-5">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 font-mono text-xs uppercase tracking-[0.2em] text-white/20">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex items-center gap-12 shrink-0">
              <span className="flex items-center gap-3"><Zap className="w-3 h-3 text-amber-400/50" /> Zero monthly fees</span>
              <span className="text-white/10">◆</span>
              <span className="flex items-center gap-3"><Shield className="w-3 h-3 text-emerald-400/50" /> Enterprise-grade security</span>
              <span className="text-white/10">◆</span>
              <span className="flex items-center gap-3"><Globe className="w-3 h-3 text-blue-400/50" /> Global CDN distribution</span>
              <span className="text-white/10">◆</span>
              <span>Instant Stripe payouts</span>
              <span className="text-white/10">◆</span>
              <span>EPUB auto-generation</span>
              <span className="text-white/10">◆</span>
              <span>Multi-format publishing</span>
              <span className="text-white/10">◆</span>
              <span>Built on Publica.la infrastructure</span>
              <span className="text-white/10">◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MEDIA TYPES — Asymmetric architectural grid
          ══════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03] relative">
        <Container>
          <div className="flex justify-between items-end mb-16 border-b border-white/[0.05] pb-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-[#FAFAFA] leading-none tracking-tight">
              A home for <br />
              <span className="italic text-white/30">every format.</span>
            </h2>
            <div className="hidden md:block text-right">
              <span className="font-mono text-[10px] text-brand-400/40 uppercase tracking-[0.25em]">[ Capabilities ]</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-white/[0.05] relative z-10">
            {/* Text — Large Cell */}
            <div className="md:col-span-7 bg-[#080808] p-10 md:p-12 group hover:bg-amber-500/[0.03] transition-all duration-500 border-t-2 border-transparent hover:border-amber-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-1/2 -translate-y-1/2" />
              <div className="flex justify-between items-start mb-20 relative z-10">
                <div className="w-14 h-14 bg-amber-500/5 border border-amber-500/20 flex items-center justify-center group-hover:border-amber-500/40 transition-colors">
                  <FileText className="w-6 h-6 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
                </div>
                <span className="font-mono text-[10px] text-amber-500/30 tracking-[0.3em]">01</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-heading text-[#FAFAFA] mb-4 group-hover:text-amber-400 transition-colors relative z-10">Editorial & Text</h3>
              <p className="text-white/40 text-lg leading-relaxed relative z-10">In-depth articles, serialized fiction, and premium newsletters rendered in beautiful typography.</p>
            </div>

            {/* Audio — Medium Cell */}
            <div className="md:col-span-5 bg-[#080808] p-10 md:p-12 group hover:bg-emerald-500/[0.03] transition-all duration-500 border-t-2 border-transparent hover:border-emerald-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-1/2 -translate-y-1/2" />
              <div className="flex justify-between items-start mb-20 relative z-10">
                <div className="w-14 h-14 bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center group-hover:border-emerald-500/40 transition-colors">
                  <Mic className="w-6 h-6 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="font-mono text-[10px] text-emerald-500/30 tracking-[0.3em]">02</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-heading text-[#FAFAFA] mb-4 group-hover:text-emerald-400 transition-colors relative z-10">Podcasts & Audio</h3>
              <p className="text-white/40 text-lg leading-relaxed relative z-10">High-fidelity audio delivery with built-in premium playback.</p>
            </div>

            {/* Video — Wide Bottom Cell */}
            <div className="md:col-span-8 bg-[#080808] p-10 md:p-12 group hover:bg-purple-500/[0.03] transition-all duration-500 border-b-2 border-transparent hover:border-purple-500/50 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/[0.02] rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-1/2 translate-y-1/2" />
              <div className="flex justify-between items-start mb-16 relative z-10">
                <div className="w-14 h-14 bg-purple-500/5 border border-purple-500/20 flex items-center justify-center group-hover:border-purple-500/40 transition-colors">
                  <Video className="w-6 h-6 text-purple-500/50 group-hover:text-purple-400 transition-colors" />
                </div>
                <span className="font-mono text-[10px] text-purple-500/30 tracking-[0.3em]">03</span>
              </div>
              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div>
                  <h3 className="text-3xl sm:text-4xl font-heading text-[#FAFAFA] mb-4 group-hover:text-purple-400 transition-colors">Premium Video</h3>
                  <p className="text-white/40 text-lg leading-relaxed">Sell masterclasses and exclusive clips with secure streaming, protecting your IP.</p>
                </div>
              </div>
            </div>

            {/* Images — Corner Cell */}
            <div className="md:col-span-4 bg-[#080808] p-10 md:p-12 group hover:bg-blue-500/[0.03] transition-all duration-500 border-b-2 border-transparent hover:border-blue-500/50 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/[0.02] rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-1/3 translate-y-1/3" />
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="w-14 h-14 bg-blue-500/5 border border-blue-500/20 flex items-center justify-center group-hover:border-blue-500/40 transition-colors">
                  <ImageIcon className="w-6 h-6 text-blue-500/50 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="font-mono text-[10px] text-blue-500/30 tracking-[0.3em]">04</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl sm:text-4xl font-heading text-[#FAFAFA] mb-4 group-hover:text-blue-400 transition-colors">Photography</h3>
                <p className="text-white/40 text-lg leading-relaxed">High-res galleries & collections.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════
          WORKFLOW — Three-step mechanism
          ══════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03] relative overflow-hidden">
        <Container>
          <div className="max-w-3xl mb-20">
            <span className="inline-block uppercase tracking-[0.25em] text-[10px] font-mono text-brand-400 mb-6">Workflow</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-[#FAFAFA] leading-[0.9]">
              Publishing engineered<br />for <span className="italic text-white/30">velocity.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05]">
            {[
              { step: '01', icon: Upload, title: 'Upload', desc: 'Drag, drop, and configure pricing in a distraction-free interface.', accent: 'amber' },
              { step: '02', icon: Share2, title: 'Distribute', desc: 'Secure links and automated paywalls ready to deploy anywhere.', accent: 'emerald' },
              { step: '03', icon: DollarSign, title: 'Capture Revenue', desc: 'Instant payouts and detailed analytics to drive your growth.', accent: 'brand' },
            ].map((item) => (
              <div key={item.step} className="bg-[#080808] p-10 md:p-14 relative group border-t-2 border-transparent hover:border-white/20 transition-all duration-500 hover:bg-white/[0.01]">
                <div className="font-mono text-[10px] text-white/15 mb-16 tracking-[0.3em]">{item.step}</div>
                <item.icon className="w-8 h-8 text-white/20 mb-8 group-hover:text-white/80 transition-colors duration-500" strokeWidth={1} />
                <h3 className="text-2xl sm:text-3xl font-heading text-[#FAFAFA] mb-4 group-hover:text-brand-400 transition-colors">{item.title}</h3>
                <p className="text-white/40 text-base sm:text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════
          ECONOMICS — Massive typographic pricing
          ══════════════════════════════════════════════════ */}
      <section className="py-32 sm:py-40 border-b border-white/[0.03] relative overflow-hidden">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-0 items-center">
            <div className="lg:pr-16">
              <span className="inline-block uppercase tracking-[0.25em] text-[10px] font-mono text-white/30 mb-8 border border-white/10 px-4 py-2">
                Economics
              </span>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-heading text-[#FAFAFA] mb-8 leading-[0.85] tracking-tight">
                Aligned<br />
                <span className="italic text-white/30">incentives.</span>
              </h2>
              <p className="text-xl text-white/50 mb-10 max-w-md leading-relaxed">
                We only succeed when you do. No monthly fees. Radically transparent economics designed for ambitious creators.
              </p>
              <Button asChild className="rounded-none bg-transparent border border-white/10 text-white/60 hover:text-white hover:border-white/30 h-14 px-8 text-xs font-mono uppercase tracking-widest">
                <Link href="/pricing">
                  View full pricing <ArrowRight className="ml-3 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="lg:border-l border-white/[0.05] lg:pl-16">
              {/* 0% block */}
              <div className="mb-16 pb-16 border-b border-white/[0.05] relative">
                <div className="text-[clamp(6rem,12vw,12rem)] font-heading text-brand-400 leading-none tracking-tighter">
                  0<span className="text-brand-400/40">%</span>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-brand-500/[0.02] rounded-full blur-[100px] pointer-events-none -translate-x-1/4" />
                <p className="text-2xl text-white/60 font-heading mt-2">Monthly subscription fee</p>
                <p className="text-white/30 font-mono text-xs uppercase tracking-widest mt-3">Free to start — forever</p>
              </div>

              {/* 15% block */}
              <div className="relative">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-6xl sm:text-7xl font-heading text-[#FAFAFA] leading-none tracking-tighter">15<span className="text-white/30">%</span></span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 max-w-[120px] leading-tight">Fee per transaction</span>
                </div>
                <p className="text-lg text-white/40 leading-relaxed">Includes all infrastructure, bandwidth, and standard payment processing costs.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════
          SOCIAL PROOF — Trust strip
          ══════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 border-b border-white/[0.03]">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.05]">
            {[
              { value: '10K+', label: 'Creators Active' },
              { value: '$2M+', label: 'Revenue Processed' },
              { value: '50+', label: 'Countries Reached' },
              { value: '99.9%', label: 'Uptime Guaranteed' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#080808] p-8 md:p-10 text-center group hover:bg-white/[0.01] transition-colors">
                <div className="text-3xl sm:text-4xl font-heading text-[#FAFAFA] mb-3 group-hover:text-brand-400 transition-colors">{stat.value}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════
          FINAL CTA — Maximum gravitas
          ══════════════════════════════════════════════════ */}
      <section className="py-32 sm:py-40 relative group overflow-hidden">
        <Container className="text-center relative z-10">
          <span className="inline-block font-mono text-[10px] text-brand-400 uppercase tracking-[0.3em] mb-8 border border-brand-500/20 bg-brand-500/5 px-4 py-2">
            Ready State Achieved
          </span>
          <h2 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-heading text-[#FAFAFA] mb-6 tracking-tight leading-[0.85]">
            Begin<br className="sm:hidden" /> <span className="italic text-white/30">transmitting.</span>
          </h2>
          <p className="text-lg sm:text-xl text-white/40 mb-14 max-w-lg mx-auto leading-relaxed">
            Your audience is waiting. Join the network and start earning from your first upload.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-16 sm:h-20 px-12 sm:px-16 text-sm sm:text-base font-mono uppercase tracking-widest font-semibold border-none group/btn"
          >
            <Link href="/auth/signup">
              Create your account <ArrowUpRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
            </Link>
          </Button>
        </Container>

        {/* Pulsing brand glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-500/[0.04] rounded-full blur-[150px] pointer-events-none group-hover:bg-brand-500/[0.08] transition-all duration-[2000ms]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/[0.03] rounded-full blur-[120px] pointer-events-none group-hover:bg-purple-500/[0.05] transition-all duration-[2000ms] delay-200" />
      </section>
    </div>
  )
}
