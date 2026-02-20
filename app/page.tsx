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
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section
        aria-label="Hero"
        className="relative overflow-hidden bg-[#0a0a0a] pt-32 pb-40"
      >
        {/* Noise overlay */}
        <div className="noise" aria-hidden="true" />

        {/* Aurora orbs */}
        <div className="aurora-orb-1 top-[-200px] left-[-100px]" aria-hidden="true" />
        <div className="aurora-orb-2 top-[-100px] right-[-150px]" aria-hidden="true" />
        <div className="aurora-orb-3 bottom-[-150px] left-[30%]" aria-hidden="true" />

        <Container className="text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-bold text-[#FAFAFA] mb-6 leading-[1.05] tracking-tight">
            Sell what you{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-white">
              create
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
            Publish text, audio, images & video. Set your price.
            Keep <span className="text-brand-400 font-semibold">85%</span> of every sale.
          </p>
          <Button asChild variant="gradient" size="lg" className="px-10 py-5 text-lg font-semibold">
            <Link href="/auth/signup">
              Start publishing free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </Container>
      </section>

      {/* Content Types — Bento Grid */}
      <section aria-label="Content types" className="py-24 sm:py-32">
        <Container>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#FAFAFA] mb-12 text-center">
            Publish any type of content
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Text — spans 2 cols */}
            <div className="sm:col-span-2 lg:col-span-2 group flex flex-col p-8 rounded-2xl bg-surface-1 border border-white/[0.06] hover:border-brand-500/30 transition-all">
              <div className="w-14 h-14 bg-brand-500/15 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-brand-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-1">Text</h3>
              <p className="text-white/50">Articles & newsletters</p>
            </div>

            {/* Audio */}
            <div className="group flex flex-col p-8 rounded-2xl bg-surface-1 border border-white/[0.06] hover:border-emerald-500/30 transition-all">
              <div className="w-14 h-14 bg-emerald-500/15 rounded-xl flex items-center justify-center mb-4">
                <Mic className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-1">Audio</h3>
              <p className="text-white/50">Podcasts & music</p>
            </div>

            {/* Images */}
            <div className="group flex flex-col p-8 rounded-2xl bg-surface-1 border border-white/[0.06] hover:border-purple-500/30 transition-all">
              <div className="w-14 h-14 bg-purple-500/15 rounded-xl flex items-center justify-center mb-4">
                <ImageIcon className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-1">Images</h3>
              <p className="text-white/50">Photography & art</p>
            </div>

            {/* Video — spans 2 cols */}
            <div className="sm:col-span-2 lg:col-span-2 group flex flex-col p-8 rounded-2xl bg-surface-1 border border-white/[0.06] hover:border-orange-500/30 transition-all">
              <div className="w-14 h-14 bg-orange-500/15 rounded-xl flex items-center justify-center mb-4">
                <Video className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-1">Video</h3>
              <p className="text-white/50">Courses & clips</p>
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section aria-label="How it works" className="py-24 sm:py-32 bg-surface-1">
        <Container>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#FAFAFA] mb-14 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-brand-500/30" aria-hidden="true" />

            {[
              { step: '1', icon: Upload, title: 'Create', desc: 'Upload your content and set your price. Done in minutes.' },
              { step: '2', icon: Share2, title: 'Share', desc: 'Get a beautiful link. Share it anywhere your audience lives.' },
              { step: '3', icon: DollarSign, title: 'Earn', desc: 'Get paid automatically. Keep 85% of every sale.' },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">{item.title}</h3>
                <p className="text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section aria-label="Pricing" className="py-24 sm:py-32">
        <Container>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#FAFAFA] mb-4">
              Simple pricing
            </h2>
            <div className="bg-surface-1 rounded-3xl p-10 border border-brand-500/20 glow-brand mt-8">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-6xl font-bold text-brand-400">$0</span>
                <span className="text-xl text-white/40">/month</span>
              </div>
              <p className="text-white/50 mb-8">15% fee only when you get paid</p>
              <ul className="space-y-3 text-left max-w-xs mx-auto mb-8">
                {['Unlimited publishing', 'Built-in payments', 'Analytics dashboard', 'Keep 85% of earnings'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white/60">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="gradient" size="lg" className="px-10 text-lg font-semibold">
                <Link href="/auth/signup">Start for free <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section aria-label="Call to action" className="relative py-24 bg-gradient-to-r from-brand-600 to-brand-700 overflow-hidden">
        {/* Noise overlay */}
        <div className="noise" aria-hidden="true" />
        <Container className="text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Ready to start earning?
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-xl mx-auto">
            Create your first post today. No credit card needed.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#0a0a0a] hover:bg-white/90 px-10 py-5 text-lg font-semibold"
          >
            <Link href="/auth/signup">
              Get started now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </Container>
      </section>
    </div>
  )
}
