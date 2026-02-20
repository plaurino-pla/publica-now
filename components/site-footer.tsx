import Link from 'next/link'
import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div>
            <Link href="/" className="inline-flex items-center space-x-3 mb-4">
              <Image
                src="/images/publica-now-logo.svg"
                alt="publica.now"
                width={40}
                height={40}
                className="h-10 w-10 brightness-0 invert"
                priority
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">publica.now</span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">by publica.la</span>
              </div>
            </Link>
            <p className="text-gray-300 max-w-md">
              Go from idea to income in minutes. Publish, monetize, and grow your audience instantly.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/creators" className="text-gray-300 hover:text-white transition-colors text-sm">Discover</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</Link></li>
                <li><Link href="/features" className="text-gray-300 hover:text-white transition-colors text-sm">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6">
          <p className="text-gray-500 text-sm">
            &copy; 2026 publica.now. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
