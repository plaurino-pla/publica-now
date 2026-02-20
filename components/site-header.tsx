import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Search, Menu, X } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserMenu } from '@/components/user-menu'
import { MobileNav } from '@/components/mobile-nav'

export async function SiteHeader() {
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo - Different behavior for logged-in vs signed-out */}
        <Link href={session?.user ? "/dashboard" : "/"} className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <Image
            src="/images/publica-now-logo.svg"
            alt="publica.now"
            width={40}
            height={40}
            className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
            priority
          />
          <div className="flex flex-col min-w-0">
            <span className="text-lg sm:text-xl font-bold text-[#FAFAFA] truncate">publica.now</span>
            <span className="text-xs text-white/40 uppercase tracking-wide hidden sm:block">by publica.la</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {session?.user ? (
          <nav className="hidden lg:flex items-center gap-6 text-sm text-white/50" aria-label="Primary">
            <Link href="/dashboard" className="hover:text-white transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/creators" className="hover:text-white transition-colors">
              Discover
            </Link>
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-8 text-sm text-white/50" aria-label="Primary">
            <Link href="/creators" className="hover:text-white transition-colors">Discover</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {session?.user ? (
            // Logged-in user actions
            <>
              {/* User Menu */}
              <UserMenu />
            </>
          ) : (
            // Signed-out user actions (marketing site)
            <>
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
                <Button asChild variant="gradient" size="pill">
                  <Link href="/auth/signup">Start Creating &rarr;</Link>
                </Button>
              </div>
            </>
          )}

          {/* Mobile menu button */}
          <MobileNav session={session} />
        </div>
      </div>
    </header>
  )
}
