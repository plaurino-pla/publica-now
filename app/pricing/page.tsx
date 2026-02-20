import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Info } from 'lucide-react'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'Economics - Zero Monthly Fees',
  description: 'Start creating and selling content with zero monthly fees. We only take 15% when you make money, including payment gateway fees. No hidden costs.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <section className="pt-32 pb-24 border-b border-white/[0.03]">
        <Container>
          <div className="max-w-4xl font-body">
            <span className="inline-block uppercase tracking-[0.2em] text-xs font-mono text-white/40 mb-8 px-3 py-1.5 border border-white/10">
              Clear Economics
            </span>
            <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-bold text-[#FAFAFA] mb-8 leading-[0.9] tracking-tight">
              Aligned <span className="italic font-serif text-white/40">incentives.</span>
            </h1>
            <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
              We only succeed when you do. No monthly fees. Radically transparent economics designed for ambitious creators.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Pricing */}
      <section className="py-24 border-b border-white/[0.03]">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-0 items-start">
            <div className="lg:pr-16">
              <h2 className="text-3xl font-heading text-[#FAFAFA] mb-8">The Setup</h2>
              <div className="space-y-6 text-white/60 mb-12">
                {[
                  'Uncapped content publishing',
                  'Frictionless payment processing',
                  'In-depth analytics & telemetry',
                  'Priority creator support',
                  'Automated email distribution'
                ].map((item, i) => (
                  <div key={item} className="flex items-center gap-4 text-lg">
                    <span className="font-mono text-xs text-brand-400">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="font-body text-[#FAFAFA]">{item}</span>
                  </div>
                ))}
              </div>

              <div className="border border-white/10 p-6 bg-white/[0.02]">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Info className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-widest text-[#FAFAFA] mb-2">Gateways Included</h4>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Our 15% take rate encompasses all network and processing fees. You will not pay additional Stripe or PayPal surcharges.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:border-l border-white/[0.05] lg:pl-16">
              <div className="mb-16">
                <span className="font-mono text-xs uppercase tracking-widest text-white/40 mb-4 block">Fixed Infrastructure Fee</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-8xl font-heading text-[#FAFAFA] leading-none">$0</span>
                  <span className="text-xl text-white/40 font-serif italic">/ mo</span>
                </div>
              </div>

              <div className="mb-16">
                <span className="font-mono text-xs uppercase tracking-widest text-white/40 mb-4 block">Network Take Rate</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-8xl font-heading text-brand-400 leading-none">15%</span>
                  <span className="text-xl text-white/40 font-serif italic">/ tx</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full text-lg h-16 rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90">
                <Link href="/auth/signup">Initiate System Sequence &rarr;</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison */}
      <section className="py-24 border-b border-white/[0.03] bg-white/[0.01]">
        <Container>
          <div className="mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-[#FAFAFA] tracking-tight">Market Context</h2>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-body border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-widest text-white/40">
                  <th className="py-6 px-4 font-normal">Provider</th>
                  <th className="py-6 px-4 font-normal">Fixed Cost</th>
                  <th className="py-6 px-4 font-normal">Variable Rate</th>
                  <th className="py-6 px-4 font-normal">Net Impact</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-8 px-4 font-heading text-[#FAFAFA] text-2xl">PUBLICA<span className="italic font-serif text-white/40">.NOW</span></td>
                  <td className="py-8 px-4 text-brand-400 font-mono">$0</td>
                  <td className="py-8 px-4 text-[#FAFAFA]">15% flat</td>
                  <td className="py-8 px-4 text-brand-400 font-mono">15% total</td>
                </tr>
                <tr className="border-b border-white/[0.03] text-white/40 hover:bg-white/[0.02] transition-colors">
                  <td className="py-8 px-4">Legacy Platforms</td>
                  <td className="py-8 px-4 font-mono">$30-$100/mo</td>
                  <td className="py-8 px-4">3-5% + Gateway</td>
                  <td className="py-8 px-4 opacity-50">High overhead</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-24 border-b border-white/[0.03]">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-4xl sm:text-5xl text-[#FAFAFA] tracking-tight mb-16">Data Query / FAQ</h2>
            <div className="space-y-12">
              {[
                { q: 'Is there really no fixed monthly fee?', a: 'Affirmative. You can host an uncapped number of files at zero base cost. The system only triggers the 15% rate upon successful transaction.' },
                { q: "What's included in the 15% network rate?", a: 'Complete structural coverage: payment routing, storage, security protocols, telemetry, email distribution, and priority clearance for support.' },
                { q: 'Can I cancel or migrate anytime?', a: "Yes. With no long-term contracts or subscription locks, your exit paths remain fully open. Your payload and data belong to you." },
                { q: 'Are international endpoints supported?', a: 'Global transmission is active. We accept multi-region currencies and standard cross-border payment protocols.' },
                { q: 'How do I query for custom economics?', a: "Enterprise logic queries can be routed directly to our operations matrix via support." },
              ].map((item, idx) => (
                <div key={item.q} className="border-l border-brand-500/30 pl-6 group">
                  <h3 className="font-mono text-sm uppercase tracking-widest text-[#FAFAFA] mb-3 group-hover:text-brand-400 transition-colors">
                    <span className="text-white/20 mr-4">Q{(idx + 1).toString().padStart(2, '0')}</span>{item.q}
                  </h3>
                  <p className="text-lg text-white/50 leading-relaxed font-body">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-brand-500/5 relative overflow-hidden">
        <Container className="text-center relative z-10">
          <h2 className="font-heading text-5xl sm:text-6xl text-[#FAFAFA] mb-8 tracking-tight">Eliminate the overhead.</h2>
          <Button asChild size="lg" className="rounded-none bg-[#FAFAFA] text-[#080808] hover:bg-white/90 h-16 px-12 text-lg border-none mt-4">
            <Link href="/auth/signup">Launch Platform</Link>
          </Button>
        </Container>
      </section>
    </div>
  )
}
