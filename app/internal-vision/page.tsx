import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { PageSection } from '@/components/ui/page-section'

export const metadata: Metadata = {
  title: 'Internal Vision & Roadmap - publica.now',
  description: 'Internal product vision and strategic roadmap for publica.now development team.',
}

export default function InternalVisionPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PageSection background="muted">
        <Container className="max-w-6xl">
          <div className="bg-surface-1 rounded-2xl border border-white/[0.08] p-8 md:p-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-4">Product Vision – Publica.now (Internal)</h1>
              <p className="text-xl text-white/50">Internal Strategic Roadmap & Development Guide</p>
              <div className="w-24 h-1 bg-brand-500 mx-auto mt-6 rounded-full"></div>
            </div>
            <div className="prose prose-lg max-w-none">
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Executive Overview</h2>
                <p className="text-white/60 leading-relaxed mb-6">
                  Publica.la has built the most reliable and secure infrastructure for long-format content publishing
                  (ebooks, audiobooks, professional distribution). With Publica.now, we are extending that same
                  enterprise-grade foundation to the creator economy, enabling independent creators, educators, and
                  influencers to publish, monetize, and grow their audiences instantly.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">The Vision</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#FAFAFA]">Seamless creation</h3>
                      <p className="text-white/60">Creators write in a simple editor (like Substack/Medium).</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#FAFAFA]">Invisible transformation</h3>
                      <p className="text-white/60">Content is auto-converted into professional formats (EPUB, audio) using Publica.la's backend.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#FAFAFA]">Flexible monetization</h3>
                      <p className="text-white/60">Creators choose subscription plans, one-time sales, or free previews.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      4
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#FAFAFA]">Audience-first experiences</h3>
                      <p className="text-white/60">Users access creator pages hosted on Publica.la infra, subscribe, and consume content.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      5
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#FAFAFA]">Trusted payments</h3>
                      <p className="text-white/60">All transactions are powered by Publica.la's payments system, with global reach and security.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Mission Statement</h2>
                <div className="bg-gradient-to-r from-brand-600 to-purple-600 text-white p-8 rounded-xl text-center">
                  <blockquote className="text-2xl font-light italic mb-4">
                    "To empower creators with instant publishing and professional monetization, built on Publica.la's world-class infrastructure."
                  </blockquote>
                  <p className="text-brand-100">
                    — publica.now
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Strategic Roadmap – Publica.now</h2>

                <div className="space-y-8">
                  <div className="border-l-4 border-green-600 pl-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">Phase 1 – Foundation (MVP)</h3>
                      <p className="text-white/50 font-medium">Objective: Deliver a usable, end-to-end flow for creators to publish and monetize.</p>
                    </div>
                    <ul className="text-white/60 space-y-2 mb-4">
                      <li>• Text editor for short-form content (Markdown/Medium-like UX)</li>
                      <li>• Automatic EPUB conversion on publish (transparent to creator)</li>
                      <li>• Creator landing page auto-generated (basic template, hosted on Publica.la)</li>
                      <li>• Subscription and one-time payment setup (integrated with Publica.la Payments)</li>
                      <li>• Reader access: free content + paid unlock via subscription</li>
                    </ul>
                    <div className="bg-emerald-500/10 p-4 rounded-lg">
                      <p className="text-emerald-300 font-semibold">
                        <strong>Outcome:</strong> A creator can sign up, write, publish, and earn revenue within minutes.
                      </p>
                    </div>
                  </div>

                  <div className="border-l-4 border-yellow-600 pl-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">Phase 2 – Engagement & Growth</h3>
                      <p className="text-white/50 font-medium">Objective: Expand monetization options and build audience loyalty.</p>
                    </div>
                    <ul className="text-white/60 space-y-2 mb-4">
                      <li>• Audio transformation: automated audiobook generation for published content</li>
                      <li>• Subscription tiers: multiple plans (basic, premium, bundled)</li>
                      <li>• Free preview and teaser content controls</li>
                      <li>• Analytics dashboard: subscriber counts, revenue, top content</li>
                      <li>• Improved storefront customization: logos, themes, brand elements</li>
                    </ul>
                    <div className="bg-amber-500/10 p-4 rounded-lg">
                      <p className="text-amber-300 font-semibold">
                        <strong>Outcome:</strong> Creators start building sustainable revenue streams and differentiated audiences.
                      </p>
                    </div>
                  </div>

                  <div className="border-l-4 border-brand-600 pl-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-[#FAFAFA] mb-2">Phase 3 – Scale & Intelligence</h3>
                      <p className="text-white/50 font-medium">Objective: Offer professional-grade growth tools for serious creators.</p>
                    </div>
                    <ul className="text-white/60 space-y-2 mb-4">
                      <li>• Advanced analytics: churn, retention, cohort performance</li>
                      <li>• Marketing tools: discounts, referral codes, bundles</li>
                      <li>• API & embed tools for external integration (websites, newsletters, apps)</li>
                      <li>• Mobile app: creators publish and track revenue on the go</li>
                      <li>• AI-powered recommendations for pricing, content strategy, and audience growth</li>
                    </ul>
                    <div className="bg-brand-500/10 p-4 rounded-lg">
                      <p className="text-brand-300 font-semibold">
                        <strong>Outcome:</strong> Publica.now is positioned as the go-to platform for independent monetization, with scalability and sophistication rivaling any competitor.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Logical Dependency Chain</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <h3 className="font-semibold text-[#FAFAFA] mb-2">Core flow:</h3>
                    <p className="text-white/60">text editor → publish → paywall → subscription → payout</p>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <h3 className="font-semibold text-[#FAFAFA] mb-2">Content transformation & delivery:</h3>
                    <p className="text-white/60">invisible EPUB + audiobook conversion</p>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <h3 className="font-semibold text-[#FAFAFA] mb-2">Monetization expansion:</h3>
                    <p className="text-white/60">tiers, previews, bundles</p>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <h3 className="font-semibold text-[#FAFAFA] mb-2">Creator growth:</h3>
                    <p className="text-white/60">analytics, marketing, customization</p>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <h3 className="font-semibold text-[#FAFAFA] mb-2">Intelligence & integrations:</h3>
                    <p className="text-white/60">AI insights, external APIs, mobile app</p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Risks & Mitigations</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 border border-red-500/20 rounded-xl bg-red-500/10">
                    <h3 className="text-lg font-semibold text-red-300 mb-3">Scope creep</h3>
                    <p className="text-red-400">Avoid overbuilding; stick to atomic, testable features.</p>
                  </div>
                  <div className="p-6 border border-amber-500/20 rounded-xl bg-amber-500/10">
                    <h3 className="text-lg font-semibold text-amber-300 mb-3">Adoption friction</h3>
                    <p className="text-amber-400">Keep MVP onboarding &lt;10 minutes from sign-up to publish.</p>
                  </div>
                  <div className="p-6 border border-brand-500/20 rounded-xl bg-brand-500/10">
                    <h3 className="text-lg font-semibold text-brand-300 mb-3">Scaling challenges</h3>
                    <p className="text-brand-400">Use Publica.la infra but monitor performance under higher short-form publishing load.</p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Deliverables Breakdown – Publica.now</h2>

                <div className="space-y-8">
                  <div className="border-l-4 border-green-600 pl-6">
                    <h3 className="text-2xl font-bold text-[#FAFAFA] mb-4">Phase 1 – Foundation (MVP)</h3>
                    <p className="text-white/50 font-medium mb-4">Goal: End-to-end flow: creator signs up → writes → publishes → gets paid.</p>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Authentication & Accounts</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Creator sign-up/login (NextAuth.js + Publica.la auth system)</li>
                          <li>• User (reader) account creation (optional: guest checkout support)</li>
                          <li>• Role management: Creator vs Reader</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Text Editor (Creator Tool)</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Rich text editor (Markdown/WYSIWYG)</li>
                          <li>• Save draft / publish button</li>
                          <li>• Basic formatting (headings, lists, bold, italic, links)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Publishing & Conversion</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Integration with Publica.la infra for auto-EPUB generation</li>
                          <li>• Basic metadata: title, description, tags</li>
                          <li>• Store file in Publica.la content storage system</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Creator Page (Auto-Generated Storefront)</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Public page with creator profile + list of published content</li>
                          <li>• Auto-hosted on Publica.la infra with unique URL</li>
                          <li>• Basic theme (clean default template)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Monetization (Payments Infra)</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Create subscription or one-time price per content</li>
                          <li>• Checkout integration (Publica.la Payments API)</li>
                          <li>• Link revenue to creator account (payout workflow)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Reader Experience</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Free vs Paid content distinction (lock/unlock mechanism)</li>
                          <li>• Consume content (web reader for text, EPUB rendering)</li>
                          <li>• Subscription purchase flow (link to payment + instant unlock)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-yellow-600 pl-6">
                    <h3 className="text-2xl font-bold text-[#FAFAFA] mb-4">Phase 2 – Engagement & Growth</h3>
                    <p className="text-white/50 font-medium mb-4">Goal: Add monetization flexibility, audience engagement, and analytics.</p>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Audio Transformation</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Pipeline to auto-generate audio (TTS or upload option)</li>
                          <li>• Player integration in reader page</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Subscription Tiers & Controls</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Multi-tier plans (e.g. Basic, Premium)</li>
                          <li>• Free preview toggle (first X% free)</li>
                          <li>• Bundled content support (multiple posts/books under one plan)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Analytics Dashboard (Creator)</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Metrics: subscribers, sales, content performance</li>
                          <li>• Export basic reports (CSV)</li>
                          <li>• Visual charts (engagement over time)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Enhanced Creator Page Customization</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Upload logo + change color theme</li>
                          <li>• Add About/Bio section</li>
                          <li>• Customizable landing page layout options</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-brand-600 pl-6">
                    <h3 className="text-2xl font-bold text-[#FAFAFA] mb-4">Phase 3 – Scale & Intelligence</h3>
                    <p className="text-white/50 font-medium mb-4">Goal: Professional creator tools, integrations, and AI insights.</p>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Advanced Analytics</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Retention, churn, LTV, cohort analysis</li>
                          <li>• Subscriber segmentation</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Marketing & Growth Tools</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Discount codes</li>
                          <li>• Referral programs</li>
                          <li>• Bundling logic (cross-content or multi-creator)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">API & Integration Layer</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Public API for creators (embed content in newsletters/websites)</li>
                          <li>• Webhooks for subscriber events (new signup, cancellation)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">Mobile App (Creator + Reader)</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Creator: publish content, track revenue</li>
                          <li>• Reader: subscribe, read, listen</li>
                          <li>• Sync with Publica.la infra</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-[#FAFAFA] mb-2">AI-Powered Insights</h4>
                        <ul className="text-white/60 space-y-1 ml-4">
                          <li>• Revenue prediction and pricing suggestions</li>
                          <li>• Audience engagement recommendations (best time to publish, content formats)</li>
                          <li>• Content tagging and SEO optimization assistant</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Logical Order of Development (Dependencies)</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <h3 className="font-semibold text-[#FAFAFA] mb-2">Phase 1 foundation:</h3>
                    <p className="text-white/60">auth, editor, publish, paywall, checkout</p>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <h3 className="font-semibold text-[#FAFAFA] mb-2">Phase 2 expansion:</h3>
                    <p className="text-white/60">audio, tiers, analytics, customization</p>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg">
                    <h3 className="font-semibold text-[#FAFAFA] mb-2">Phase 3 growth tools:</h3>
                    <p className="text-white/60">AI, APIs, mobile app, marketing</p>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold text-[#FAFAFA] mb-6">Atomic Sprint Examples (MVP Phase)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-surface-2 rounded-xl">
                    <h3 className="text-lg font-semibold text-[#FAFAFA] mb-3">Sprint 1: Auth + roles + basic text editor</h3>
                    <p className="text-white/60 text-sm">Foundation for user management and content creation</p>
                  </div>
                  <div className="p-6 bg-surface-2 rounded-xl">
                    <h3 className="text-lg font-semibold text-[#FAFAFA] mb-3">Sprint 2: Publish pipeline (save → EPUB)</h3>
                    <p className="text-white/60 text-sm">Core content transformation and storage</p>
                  </div>
                  <div className="p-6 bg-surface-2 rounded-xl">
                    <h3 className="text-lg font-semibold text-[#FAFAFA] mb-3">Sprint 3: Creator page auto-generation + content listing</h3>
                    <p className="text-white/60 text-sm">Public-facing creator presence</p>
                  </div>
                  <div className="p-6 bg-surface-2 rounded-xl">
                    <h3 className="text-lg font-semibold text-[#FAFAFA] mb-3">Sprint 4: Payments integration (checkout, payout)</h3>
                    <p className="text-white/60 text-sm">Monetization infrastructure</p>
                  </div>
                  <div className="p-6 bg-surface-2 rounded-xl">
                    <h3 className="text-lg font-semibold text-[#FAFAFA] mb-3">Sprint 5: Reader experience (web reader + lock/unlock)</h3>
                    <p className="text-white/60 text-sm">End-user content consumption</p>
                  </div>
                </div>
              </section>
            </div>
            <div className="mt-8 text-center">
              <a href="/product-vision" className="inline-block">
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
                  View Public Vision
                </button>
              </a>
            </div>
          </div>
        </Container>
      </PageSection>
    </div>
  )
}
