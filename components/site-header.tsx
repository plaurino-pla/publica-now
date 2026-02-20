import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/mobile-nav'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserMenu } from '@/components/user-menu'

export async function SiteHeader() {
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.03] bg-[#080808]/90 backdrop-blur supports-[backdrop-filter]:bg-[#080808]/80 font-body">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        {/* Logo - Different behavior for logged-in vs signed-out */}
        <Link href={session?.user ? "/dashboard" : "/"} className="flex flex-col min-w-0 group pt-1">
          <span className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-[#FAFAFA] truncate group-hover:text-white transition-colors">
            publica<span className="text-white/40 font-serif italic font-normal">.now</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        {session?.user ? (
          <nav className="hidden lg:flex items-center gap-8 text-sm" aria-label="Primary">
            <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors uppercase tracking-[0.1em] text-xs font-mono">
              Dashboard
            </Link>
            <Link href="/creators" className="text-white/60 hover:text-white transition-colors uppercase tracking-[0.1em] text-xs font-mono">
              Network
            </Link>
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-10 text-sm" aria-label="Primary">
            <Link href="/creators" className="text-white/60 hover:text-white transition-colors uppercase tracking-[0.1em] text-xs font-mono">Index</Link>
            <Link href="/pricing" className="text-white/60 hover:text-white transition-colors uppercase tracking-[0.1em] text-xs font-mono">Economics</Link>
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {session?.user ? (
            <UserMenu />
          ) : (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Button asChild variant="ghost" className="uppercase tracking-[0.1em] text-xs font-mono">
                  <Link href="/auth/signin">Log In</Link>
                </Button>
                <Button asChild variant="default" className="uppercase tracking-[0.1em] text-xs font-mono border border-transparent">
                  <Link href="/auth/signup">Initiate</Link>
                </Button>
              </div>
            </>
          )}
          <div className="md:hidden">
            <MobileNav session={session} />
          </div>
        </div>
      </div>
    </header>
  )
}
