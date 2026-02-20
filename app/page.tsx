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
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080808] selection:bg-brand-500/30">
      <div className="noise" aria-hidden="true" />

      {/* Hero Section: Editorial & Sharp */}
      <section className="relative pt-40 pb-32 overflow-hidden border-b border-white/[0.03]">
        <Container className="relative z-10 font-body">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end">
            <div className="lg:col-span-8">
              <span className="inline-block uppercase tracking-[0.2em] text-xs font-mono text-brand-400 mb-8 border border-brand-500/20 bg-brand-500/5 px-3 py-1.5">
                The new creator standard
              </span>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-heading text-[#F2F2F0] leading-[0.9] tracking-tight mb-8">
                Monetize <br />
                <span className="italic text-white/40 font-serif">without</span> friction.
              </h1>
            </div>

            <div className="lg:col-span-4 lg:mb-4 lg:pl-10 lg:border-l border-white/[0.05]">
              <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-8 max-w-md">
                A radically simple platform to publish and sell text, audio, images, and video. Keep <strong className="text-[#FAFAFA] font-medium">85%</strong> of everything you earn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-14 px-8 text-base font-semibold group"
                >
                  <Link href="/auth/signup">
                    Start publishing free
                    <ArrowUpRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>

        {/* Hero Background Accent */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      </section>

      {/* Media Types Grid: Architectural & Asymmetrical */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03] relative">
        <Container>
          <div className="flex justify-between items-end mb-16 border-b border-white/[0.05] pb-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-[#FAFAFA] leading-none tracking-tight">
              A home for <br />
              <span className="italic text-white/40">every format.</span>
            </h2>
            <div className="hidden md:block text-right">
              <span className="font-mono text-xs text-brand-400/50 uppercase tracking-widest">[ Capabilities ]</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-white/[0.05] relative z-10">
            {/* Text: Large Cell */}
            <div className="md:col-span-7 bg-[#080808] p-10 group hover:bg-amber-500/[0.02] transition-colors border-t-2 border-transparent hover:border-amber-500/50">
              <div className="flex justify-between items-start mb-24">
                <div className="w-12 h-12 bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
                </div>
                <span className="font-mono text-xs text-amber-500/30">01</span>
              </div>
              <h3 className="text-3xl font-heading text-[#FAFAFA] mb-4 group-hover:text-amber-400 transition-colors">Editorial & Text</h3>
              <p className="text-white/50 text-lg">In-depth articles, serialized fiction, and premium newsletters rendered in beautiful typography.</p>
            </div>

            {/* Audio: Medium Cell */}
            <div className="md:col-span-5 bg-[#080808] p-10 group hover:bg-emerald-500/[0.02] transition-colors border-t-2 border-transparent hover:border-emerald-500/50">
              <div className="flex justify-between items-start mb-24">
                <div className="w-12 h-12 bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-emerald-500/60 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="font-mono text-xs text-emerald-500/30">02</span>
              </div>
              <h3 className="text-3xl font-heading text-[#FAFAFA] mb-4 group-hover:text-emerald-400 transition-colors">Podcasts & Audio</h3>
              <p className="text-white/50 text-lg">High-fidelity audio delivery with built-in premium playback.</p>
            </div>

            {/* Video: Wide Bottom Cell */}
            <div className="md:col-span-8 bg-[#080808] p-10 group hover:bg-purple-500/[0.02] transition-colors border-b-2 border-transparent hover:border-purple-500/50">
              <div className="flex justify-between items-start mb-16">
                <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-500/60 group-hover:text-purple-400 transition-colors" />
                </div>
                <span className="font-mono text-xs text-purple-500/30">03</span>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-heading text-[#FAFAFA] mb-4 group-hover:text-purple-400 transition-colors">Premium Video</h3>
                  <p className="text-white/50 text-lg">Sell masterclasses and exclusive clips with secure streaming, protecting your IP.</p>
                </div>
              </div>
            </div>

            {/* Images: Small Corner Cell */}
            <div className="md:col-span-4 bg-[#080808] p-10 group hover:bg-blue-500/[0.02] transition-colors border-b-2 border-transparent hover:border-blue-500/50 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 bg-blue-500/5 border border-blue-500/20 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-blue-500/60 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="font-mono text-xs text-blue-500/30">04</span>
              </div>
              <div>
                <h3 className="text-3xl font-heading text-[#FAFAFA] mb-4 group-hover:text-blue-400 transition-colors">Photography</h3>
                <p className="text-white/50 text-lg">High-res galleries & collections.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mechanism */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03] relative overflow-hidden">
        <Container>
          <div className="max-w-3xl mb-20">
            <span className="inline-block uppercase tracking-[0.2em] text-xs font-mono text-brand-400 mb-6">Workflow</span>
            <h2 className="text-4xl sm:text-6xl font-heading text-[#FAFAFA] leading-[0.95]">
              Publishing engineered for velocity.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-px md:bg-white/[0.05] md:p-px overflow-hidden">
            {[
              { step: '01', icon: Upload, title: 'Upload', desc: 'Drag, drop, and configure pricing in a distraction-free interface.' },
              { step: '02', icon: Share2, title: 'Distribute', desc: 'Secure links and automated paywalls ready to deploy anywhere.' },
              { step: '03', icon: DollarSign, title: 'Capture Revenue', desc: 'Instant payouts and detailed analytics to drive your growth.' },
            ].map((item) => (
              <div key={item.step} className="bg-[#080808] p-8 md:p-12 relative group glow-card border border-white/[0.05] md:border-none">
                <div className="text-xs font-mono text-white/20 mb-16">{item.step}</div>
                <item.icon className="w-8 h-8 text-white/80 mb-8" strokeWidth={1} />
                <h3 className="text-2xl font-heading text-[#FAFAFA] mb-4 group-hover:text-brand-400 transition-colors">{item.title}</h3>
                <p className="text-white/50 text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing - Minimalist, No "cards" just layout */}
      <section className="py-24 sm:py-32 border-b border-white/[0.03]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            <div>
              <span className="inline-block uppercase tracking-[0.2em] text-xs font-mono text-white/40 mb-6 border border-white/10 px-3 py-1.5">
                Economics
              </span>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-heading text-[#FAFAFA] mb-8 leading-[0.9]">
                Aligned <br />
                <span className="italic text-white/40">incentives.</span>
              </h2>
              <p className="text-xl text-white/60 mb-8 max-w-md">
                We only succeed when you do. No monthly fees. Radically transparent economics designed for ambitious creators.
              </p>
            </div>

            <div className="lg:border-l border-white/[0.05] lg:pl-16">
              <div className="mb-12 border-b border-white/[0.05] pb-12">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-8xl md:text-9xl font-heading text-brand-400 leading-none tracking-tighter">0%</span>
                </div>
                <p className="text-2xl text-white/80 font-heading">Monthly subscription fee</p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-heading text-[#FAFAFA]">15%</span>
                  <span className="font-mono text-xs uppercase tracking-widest text-white/40">Fee per transaction</span>
                </div>
                <p className="text-lg text-white/50">Includes all infrastructure, bandwidth, and standard payment processing costs.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final Editorial Call to Action */}
      <section className="py-32 relative group">
        <Container className="text-center relative z-10">
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-heading text-[#FAFAFA] mb-12 tracking-tight">
            Begin <span className="italic text-white/40">transmitting.</span>
          </h2>
          <Button
            asChild
            size="lg"
            className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-16 px-10 text-lg font-semibold border-none"
          >
            <Link href="/auth/signup">
              Create your account <ArrowUpRight className="ml-3 w-6 h-6" />
            </Link>
          </Button>
        </Container>

        {/* Abstract background detail for the ending statement */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-500/10 transition-colors duration-1000" />
      </section>
    </div>
  )
}
