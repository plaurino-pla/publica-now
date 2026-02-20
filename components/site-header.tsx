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
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
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
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">publica.now</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide hidden sm:block">by publica.la</span>
          </div>
        </Link>
        
        {/* Desktop Navigation - Completely different for logged-in vs signed-out */}
        {session?.user ? (
          // Logged-in user navigation
          <nav className="hidden lg:flex items-center gap-6 text-sm text-gray-600" aria-label="Primary">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/dashboard/articles" className="hover:text-gray-900 transition-colors">
              My Posts
            </Link>
            <Link href="/dashboard/analytics" className="hover:text-gray-900 transition-colors">
              Analytics
            </Link>
            <Link href="/dashboard/earnings" className="hover:text-gray-900 transition-colors">
              Earnings
            </Link>
            <Link href="/creators" className="hover:text-gray-900 transition-colors">
              Discover Creators
            </Link>
          </nav>
        ) : (
          // Signed-out user navigation (marketing site)
          <nav className="hidden lg:flex items-center gap-8 text-sm text-gray-600" aria-label="Primary">
            <Link href="/creators" className="hover:text-gray-900 transition-colors">Discover Creators</Link>
            <Link href="/features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="/how-it-works" className="hover:text-gray-900 transition-colors">How it works</Link>
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/product-vision" className="hover:text-gray-900 transition-colors">Vision</Link>
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
              {/* Search Button */}
              <Button asChild variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Link href="/creators">
                  <Search className="w-4 h-4" />
                  <span className="text-sm">Search creators</span>
                </Link>
              </Button>
              
              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Link href="/auth/signup">Get started</Link>
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
