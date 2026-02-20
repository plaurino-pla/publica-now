import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[#080808] text-white/60 border-t border-white/[0.03] overflow-hidden">
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-6 lg:col-span-5">
            <span className="font-heading text-3xl text-[#FAFAFA] tracking-tight mb-8 block">
              publica<span className="text-white/40 italic font-serif">.now</span>
            </span>
            <p className="text-xl text-white/50 leading-relaxed font-body">
              The infrastructure for the next generation of digital monoliths. Publish anywhere, monetize entirely.
            </p>
          </div>

          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7 grid grid-cols-2 gap-8 font-mono text-sm tracking-wider uppercase">
            <div>
              <h4 className="text-white/30 mb-6">Index</h4>
              <ul className="space-y-4">
                <li><Link href="/creators" className="text-[#FAFAFA] hover:text-white/60 transition-colors">Directory</Link></li>
                <li><Link href="/pricing" className="text-[#FAFAFA] hover:text-white/60 transition-colors">Economics</Link></li>
                <li><Link href="/auth/signin" className="text-[#FAFAFA] hover:text-white/60 transition-colors">Authenticate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/30 mb-6">Protocol</h4>
              <ul className="space-y-4">
                <li><Link href="/privacy" className="text-[#FAFAFA] hover:text-white/60 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-[#FAFAFA] hover:text-white/60 transition-colors">Terms of Service</Link></li>
                <li><a href="https://publica.la" className="text-[#FAFAFA] hover:text-white/60 transition-colors">publica.la</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-12 flex flex-col items-center">
          {/* Massive Typographic mark in the background / bottom */}
          <div className="w-full text-center select-none overflow-hidden pb-8">
            <span className="text-[12vw] font-heading leading-none font-bold text-white/[0.02] tracking-tighter whitespace-nowrap">
              PUBLICA<span className="italic font-serif">.NOW</span>
            </span>
          </div>

          <div className="w-full flex justify-between items-center text-xs font-mono uppercase tracking-widest text-white/30">
            <span>© 2026 PUBLICA NETWORK</span>
            <span>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
