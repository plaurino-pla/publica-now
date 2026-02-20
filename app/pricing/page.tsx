import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Info } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

export const metadata: Metadata = {
  title: 'Pricing - Zero Monthly Fees, Just 15% Transaction Fee',
  description: 'Start creating and selling content with zero monthly fees. We only take 15% when you make money, including payment gateway fees. No hidden costs.',
  openGraph: {
    title: 'publica.now Pricing - Zero Monthly Fees',
    description: 'Start creating and selling content with zero monthly fees. We only take 15% when you make money.',
    images: ['/images/og-image.svg'],
  },
  alternates: { canonical: '/pricing' },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <PageSection background="white">
        <Container className="text-center">
          <h1 className="font-heading text-5xl font-bold text-[#FAFAFA] mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-white/50 max-w-3xl mx-auto">Start publishing for free. Only pay when you earn. No monthly fees, no hidden costs, just clear transaction fees.</p>
        </Container>
      </PageSection>

      {/* Main Pricing */}
      <PageSection>
        <Container>
          <div className="max-w-4xl mx-auto">
            <Card className="text-center border-2 border-white/[0.08]">
              <CardHeader className="pb-8">
                <CardTitle className="font-heading text-4xl text-brand-400 mb-2">Creator Plan</CardTitle>
                <CardDescription className="text-xl">Everything you need to monetize your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-[#FAFAFA] mb-2"><span className="text-3xl">$</span>0</div>
                  <p className="text-white/50 text-lg">per month</p>
                  <p className="text-sm text-white/40 mt-2">No upfront costs, no monthly fees</p>
                </div>
                <div className="space-y-4 text-left max-w-lg mx-auto">
                  {['Unlimited content publishing','Beautiful content pages','Built-in payment processing','Analytics and insights','Customer support','Custom branding','Email marketing tools'].map((item) => (
                    <div key={item} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /><span>{item}</span></div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/[0.06]">
                  <div className="bg-brand-500/10 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="font-heading font-semibold text-brand-400 mb-2">Transaction Fee: 15%</h4>
                        <p className="text-brand-400 text-sm">When you accept subscriptions or payments, we take a 15% transaction fee. This includes all payment gateway fees, so you don't pay anything extra.</p>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="lg" className="w-full text-lg py-4">
                    <Link href="/auth/signup" aria-label="Start Publishing Free">Start Publishing Free</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </PageSection>

      {/* Fee Breakdown */}
      <PageSection background="white">
        <Container>
          <div className="text-center mb-16"><h2 className="font-heading text-4xl font-bold text-[#FAFAFA] mb-4">What the 15% Covers</h2><p className="text-xl text-white/50 max-w-2xl mx-auto">Our transaction fee includes everything you need to run your business</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: '💳', title: 'Payment Processing', desc: 'Credit card processing, bank transfers, and international payments. All major payment methods supported.' },
              { icon: '🔒', title: 'Security & Compliance', desc: 'PCI compliance, fraud protection, and secure data handling. Your customers\' information is always safe.' },
              { icon: '🌐', title: 'Global Infrastructure', desc: 'CDN, hosting, and global distribution. Your content loads fast for customers worldwide.' },
              { icon: '📊', title: 'Analytics & Reporting', desc: 'Detailed sales reports, customer insights, and performance metrics. Track your success in real-time.' },
              { icon: '🎯', title: 'Marketing Tools', desc: 'Email campaigns, social sharing, and audience building tools. Grow your following and increase sales.' },
              { icon: '🛠️', title: 'Customer Support', desc: "Help desk, documentation, and expert support. We're here to help you succeed every step of the way." },
            ].map((f) => (
              <Card key={f.title} className="text-center"><CardHeader><div className="w-16 h-16 bg-brand-500/15 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-2xl">{f.icon}</span></div><CardTitle className="font-heading text-xl">{f.title}</CardTitle></CardHeader><CardContent><p className="text-white/50">{f.desc}</p></CardContent></Card>
            ))}
          </div>
        </Container>
      </PageSection>

      {/* Comparison */}
      <PageSection background="muted">
        <Container>
          <div className="text-center mb-16"><h2 className="font-heading text-4xl font-bold text-[#FAFAFA] mb-4">How We Compare</h2><p className="text-xl text-white/50 max-w-2xl mx-auto">See why creators choose publica.now over other platforms</p></div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface-1 rounded-lg border border-white/[0.06] overflow-hidden">
              <div className="grid grid-cols-4 text-sm"><div className="p-4 bg-surface-2 font-semibold">Platform</div><div className="p-4 bg-surface-2 font-semibold">Monthly Fee</div><div className="p-4 bg-surface-2 font-semibold">Transaction Fee</div><div className="p-4 bg-surface-2 font-semibold">Total Cost</div></div>
              <div className="grid grid-cols-4 text-sm border-t border-white/[0.06]"><div className="p-4 font-semibold">publica.now</div><div className="p-4 text-green-400 font-semibold">$0</div><div className="p-4">15%</div><div className="p-4 text-green-400 font-semibold">15% only</div></div>
              <div className="grid grid-cols-4 text-sm border-t border-white/[0.06] bg-surface-2"><div className="p-4">Other Platforms</div><div className="p-4">$29-99/month</div><div className="p-4">3-5% + fees</div><div className="p-4 text-red-400">$348-1,188/year + fees</div></div>
            </div>
            <div className="text-center mt-8"><p className="text-white/50 mb-6"><strong>Example:</strong> If you earn $1,000/month, you keep $850 with publica.now vs. $650-750 with other platforms (after monthly fees and transaction costs).</p><Button asChild size="lg" className="text-lg px-8 py-4"><Link href="/auth/signup" aria-label="Start saving money today">Start Saving Money Today</Link></Button></div>
          </div>
        </Container>
      </PageSection>

      {/* FAQ */}
      <PageSection background="white">
        <Container>
          <div className="text-center mb-16"><h2 className="font-heading text-4xl font-bold text-[#FAFAFA] mb-4">Frequently Asked Questions</h2></div>
          <div className="max-w-3xl mx-auto space-y-8">
            {[
              { q: 'Is there really no monthly fee?', a: 'Yes, absolutely! You can publish unlimited content for free. We only take a 15% transaction fee when you actually earn money from subscriptions or sales.' },
              { q: "What's included in the 15% transaction fee?", a: 'Everything! Payment processing, security, hosting, analytics, marketing tools, and customer support. There are no hidden fees or additional charges.' },
              { q: 'Can I cancel anytime?', a: "Of course! Since there's no monthly fee, you can stop using the platform anytime. Your content and earnings remain yours." },
              { q: 'Do you support international payments?', a: 'Yes! We support customers and creators worldwide with multiple currencies and payment methods.' },
              { q: 'What if I have questions about pricing?', a: "Our support team is here to help! Contact us anytime with questions about pricing, fees, or anything else." },
            ].map((item) => (
              <div key={item.q} className="border-b border-white/[0.08] pb-6"><h3 className="font-heading text-xl font-semibold text-[#FAFAFA] mb-3">{item.q}</h3><p className="text-white/50">{item.a}</p></div>
            ))}
          </div>
        </Container>
      </PageSection>

      {/* Final CTA */}
      <PageSection background="brand">
        <Container className="text-center">
          <h2 className="font-heading text-4xl font-bold text-white mb-6">Ready to Start Earning More?</h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">Join thousands of creators who are already saving money and earning more with publica.now. Start publishing today - it's completely free.</p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4"><Link href="/auth/signup" aria-label="Start Publishing Free">Start Publishing Free</Link></Button>
        </Container>
      </PageSection>
    </div>
  )
}
