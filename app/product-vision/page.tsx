import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

export const metadata: Metadata = {
  title: 'Vision - publica.now',
  description: 'Our vision for removing barriers between creators and their audiences with instant publishing and monetization.',
}

export default function ProductVisionPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PageSection background="muted">
        <Container className="max-w-4xl">
          <div className="bg-surface-1 rounded-2xl border border-white/[0.08] p-8 md:p-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-4">
                publica.now
              </h1>
              <p className="text-xl text-white/50">
                Vision & Strategic Roadmap
              </p>
              <div className="w-24 h-1 bg-brand-500 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Vision</h2>
                <p className="text-white/60 leading-relaxed mb-6">
                  Publica.now exists to remove the barriers between creators and their audiences by offering the fastest,
                  simplest way to publish and monetize content. Built on Publica.la's infrastructure, it empowers independent
                  authors, educators, and digital creators to turn ideas into revenue instantly — without waiting for approval,
                  setting up complex stores, or giving away a cut of their earnings.
                </p>
                <p className="text-white/60 leading-relaxed">
                  Where platforms lock creators into opaque algorithms and heavy fees, Publica.now restores ownership,
                  transparency, and speed. Our goal is to make content monetization as immediate and frictionless as posting
                  a story — but with the professionalism, control, and scalability that creators need to build lasting businesses.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Vision Statement</h2>
                <div className="bg-gradient-to-r from-brand-600 to-purple-600 text-white p-8 rounded-xl text-center">
                  <blockquote className="text-2xl font-light italic mb-4">
                    "To give every creator the power to publish, sell, and grow their audience instantly — with no fees,
                    no gatekeepers, and no compromise."
                  </blockquote>
                  <p className="text-brand-100">
                    — publica.now
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Strategic Roadmap</h2>

                <div className="space-y-8">
                  <div className="border-l-4 border-green-600 pl-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">Phase 1 – Instant Publishing (MVP)</h3>
                      <p className="text-white/50 font-medium">Foundation: something usable, visible, and fast to market</p>
                    </div>
                    <ul className="text-white/60 space-y-2 mb-4">
                      <li>• Simple text editor to create new content</li>
                      <li>• Basic storefront auto-generated (custom URL + minimal branding)</li>
                      <li>• Simple one-time purchase monetization</li>
                      <li>• Direct payouts</li>
                      <li>• Creator onboarding flow (sign-up → publish → sell within minutes)</li>
                    </ul>
                    <div className="bg-emerald-500/10 p-4 rounded-lg">
                      <p className="text-emerald-300 font-semibold">
                        <strong>Outcome:</strong> A creator can go from account creation to selling content in less than 10 minutes.
                      </p>
                    </div>
                  </div>

                  <div className="border-l-4 border-yellow-600 pl-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">Phase 2 – Engagement & Growth</h3>
                      <p className="text-white/50 font-medium">Expand monetization options and deepen creator–audience connections</p>
                    </div>
                    <ul className="text-white/60 space-y-2 mb-4">
                      <li>• Subscription models and free preview options</li>
                      <li>• Creator dashboards with sales & engagement insights</li>
                      <li>• Branded storefront customization (logos, colors, audience tools)</li>
                      <li>• Newsletter management for creators</li>
                      <li>• Multi-currency & global payments</li>
                      <li>• Mobile-optimized storefront experience</li>
                    </ul>
                    <div className="bg-amber-500/10 p-4 rounded-lg">
                      <p className="text-amber-300 font-semibold">
                        <strong>Outcome:</strong> Creators begin building sustainable revenue streams and personal brands.
                      </p>
                    </div>
                  </div>

                  <div className="border-l-4 border-brand-600 pl-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">Phase 3 – Scale & Intelligence</h3>
                      <p className="text-white/50 font-medium">Give creators professional-grade tools without complexity</p>
                    </div>
                    <ul className="text-white/60 space-y-2 mb-4">
                      <li>• AI-powered audience and sales insights</li>
                      <li>• Advanced marketing & promotional tools (discounts, bundles, referral codes)</li>
                      <li>• API access for integrations with websites, newsletters, and apps</li>
                      <li>• Mobile app for publishing on the go and managing revenue</li>
                      <li>• Deeper analytics (LTV, churn, cohort analysis)</li>
                    </ul>
                    <div className="bg-brand-500/10 p-4 rounded-lg">
                      <p className="text-brand-300 font-semibold">
                        <strong>Outcome:</strong> Publica.now becomes the all-in-one backbone of the creator business — scalable, intelligent, and growth-focused.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Success Metrics</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-surface-2 rounded-xl">
                    <h3 className="text-xl font-semibold text-[#FAFAFA] mb-3">Creator Experience</h3>
                    <ul className="text-white/60 space-y-2">
                      <li>• <strong>Time to First Sale:</strong> minutes from sign-up to first monetization</li>
                      <li>• <strong>Creator Growth:</strong> monthly active creators, retention rate</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-surface-2 rounded-xl">
                    <h3 className="text-xl font-semibold text-[#FAFAFA] mb-3">Platform Performance</h3>
                    <ul className="text-white/60 space-y-2">
                      <li>• <strong>Revenue Health:</strong> GMV, average creator revenue, subscription adoption</li>
                      <li>• <strong>Platform Reliability:</strong> uptime, payout speed, content security</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Core Philosophy</h2>
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-8 rounded-xl border border-white/[0.06]">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#FAFAFA] mb-4">
                      publica.now = publishing made immediate
                    </h3>
                    <p className="text-lg text-white/60 mb-4">
                      From idea → to published → to paid, faster than any other creator platform.
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-surface-2 px-4 py-2 rounded-full border border-white/[0.08]">
                      <span className="text-2xl">⚡</span>
                      <span className="font-semibold text-[#FAFAFA]">Instant Publishing</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Key Differentiators</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">Speed First</h3>
                      <p className="text-white/60">
                        From signup to first sale in under 10 minutes. No waiting, no approval processes,
                        no complex setup required.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">Simple & Transparent Pricing</h3>
                      <p className="text-white/60">
                        We charge with a very simple and transparent pricing model. No hidden fees,
                        no surprise charges, just clear costs for the value you receive.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">Professional Infrastructure</h3>
                      <p className="text-white/60">
                        Built on Publica.la's battle-tested platform for payments, DRM, analytics, and global
                        distribution. No need to reinvent the wheel.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Call to Action</h2>
                <div className="text-center p-8 bg-surface-2 rounded-xl">
                  <h3 className="text-2xl font-bold text-[#FAFAFA] mb-4">
                    Ready to Publish Instantly?
                  </h3>
                  <p className="text-white/50 mb-6">
                    Join the revolution of instant publishing and monetization.
                    No fees, no gatekeepers, no compromise.
                  </p>
                  <div className="space-x-4">
                    <a
                      href="/dashboard/new"
                      className="inline-block bg-brand-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors"
                    >
                      Start Publishing Now
                    </a>
                    <a
                      href="/features"
                      className="inline-block bg-surface-3 text-white/80 px-8 py-3 rounded-lg font-semibold hover:bg-white/[0.15] transition-colors"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </PageSection>
    </div>
  )
}
