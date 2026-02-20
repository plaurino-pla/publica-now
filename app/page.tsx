import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'
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
    <div className="min-h-screen">
      {/* Hero */}
      <section
        aria-label="Hero"
        className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50/30 pt-20 pb-24"
      >
        <Container className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            Sell what you{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
              create
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Publish text, audio, images & video. Set your price.
            Keep <span className="text-brand-600 font-semibold">85%</span> of every sale.
          </p>
          <Button asChild variant="gradient" size="lg" className="px-10 py-5 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
            <Link href="/auth/signup">
              Start publishing free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </Container>
      </section>

      {/* Content Types — 2x2 grid */}
      <PageSection background="white" aria-label="Content types">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
          Publish any type of content
        </h2>
        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { icon: FileText, label: 'Text', desc: 'Articles & newsletters', color: 'bg-brand-500' },
            { icon: Mic, label: 'Audio', desc: 'Podcasts & music', color: 'bg-green-500' },
            { icon: ImageIcon, label: 'Images', desc: 'Photography & art', color: 'bg-purple-500' },
            { icon: Video, label: 'Video', desc: 'Courses & clips', color: 'bg-orange-500' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* How it works — 3 steps */}
      <PageSection background="muted" aria-label="How it works">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-14 text-center">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-brand-200" aria-hidden="true" />

          {[
            { step: '1', icon: Upload, title: 'Create', desc: 'Upload your content and set your price. Done in minutes.' },
            { step: '2', icon: Share2, title: 'Share', desc: 'Get a beautiful link. Share it anywhere your audience lives.' },
            { step: '3', icon: DollarSign, title: 'Earn', desc: 'Get paid automatically. Keep 85% of every sale.' },
          ].map((item) => (
            <div key={item.step} className="text-center relative">
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold relative z-10">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* Pricing */}
      <PageSection background="white" aria-label="Pricing">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple pricing
          </h2>
          <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-3xl p-10 border border-brand-200 mt-8">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-6xl font-bold text-brand-600">$0</span>
              <span className="text-xl text-gray-500">/month</span>
            </div>
            <p className="text-gray-600 mb-8">15% fee only when you get paid</p>
            <ul className="space-y-3 text-left max-w-xs mx-auto mb-8">
              {['Unlimited publishing', 'Built-in payments', 'Analytics dashboard', 'Keep 85% of earnings'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-gray-700">
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
      </PageSection>

      {/* Final CTA */}
      <section aria-label="Call to action" className="py-20 bg-gradient-to-r from-brand-600 to-brand-700">
        <Container className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to start earning?
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-xl mx-auto">
            Create your first post today. No credit card needed.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-brand-600 hover:bg-brand-50 px-10 py-5 text-lg font-semibold shadow-lg"
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
