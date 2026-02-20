'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, User, Settings, LogOut, Search, Globe, FileText, Play, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'

interface MobileNavProps {
  session: Session | null
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    return () => document.body.classList.remove('menu-open')
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
    } else {
      toggleButtonRef.current?.focus()
    }
  }, [isOpen])

  // Keyboard: ESC to close, basic focus trap
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (event.shiftKey) {
          if (active === first) {
            event.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            event.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="p-3 min-w-[44px] min-h-[44px] touch-manipulation"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
        ref={toggleButtonRef}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[9998] lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm" 
            onClick={closeMenu}
          />

          {/* Panel */}
          <div
            className="fixed inset-0 z-[9999] bg-white flex flex-col shadow-2xl h-screen"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            id="mobile-menu-panel"
            ref={panelRef}
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6 bg-white">
              <h2 id="mobile-menu-title" className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMenu}
                className="p-2 min-w-[44px] min-h-[44px] touch-manipulation"
                aria-label="Close menu"
                ref={closeButtonRef}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6 bg-white grow">
              {session?.user ? (
                <>
                  <div className="border rounded-xl p-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{session.user.email}</p>
                        <p className="text-sm text-gray-500">Creator</p>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Section */}
                  <div>
                    <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Dashboard</p>
                    <nav className="space-y-3" role="navigation" aria-label="Dashboard">
                      <Link href="/dashboard" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <User className="mr-3 h-5 w-5" /> Dashboard
                        </Button>
                      </Link>
                      <Link href="/dashboard/articles" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <FileText className="mr-3 h-5 w-5" /> My Posts
                        </Button>
                      </Link>
                      <Link href="/dashboard/analytics" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <Search className="mr-3 h-5 w-5" /> Analytics
                        </Button>
                      </Link>
                      <Link href="/dashboard/earnings" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <Globe className="mr-3 h-5 w-5" /> Earnings
                        </Button>
                      </Link>
                    </nav>
                  </div>

                  {/* Account Section */}
                  <div className="border-t pt-4 space-y-3">
                    <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Account</p>
                    <nav className="space-y-3" role="navigation" aria-label="Account">
                      <Link href="/dashboard/account" onClick={closeMenu}>
                        <Button variant="outline" className="w-full justify-start h-14 text-base" size="lg">
                          <Settings className="mr-3 h-5 w-5" /> My Account
                        </Button>
                      </Link>
                    </nav>
                  </div>

                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-14 text-base"
                      size="lg"
                      onClick={() => { closeMenu(); signOut({ callbackUrl: '/' }) }}
                    >
                      <LogOut className="mr-3 h-5 w-5" /> Sign out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Browse Section */}
                  <div>
                    <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Browse</p>
                    <nav className="space-y-3" role="navigation" aria-label="Browse">
                      <Link href="/creators" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <Search className="mr-3 h-5 w-5" /> Discover Creators
                        </Button>
                      </Link>
                      <Link href="/features" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <Globe className="mr-3 h-5 w-5" /> Features
                        </Button>
                      </Link>
                      <Link href="/how-it-works" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <Play className="mr-3 h-5 w-5" /> How it works
                        </Button>
                      </Link>
                      <Link href="/pricing" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <FileText className="mr-3 h-5 w-5" /> Pricing
                        </Button>
                      </Link>
                      <Link href="/product-vision" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start h-14 text-base" size="lg">
                          <ImageIcon className="mr-3 h-5 w-5" /> Vision
                        </Button>
                      </Link>
                    </nav>
                  </div>

                  {/* Get Started Section */}
                  <div className="border-t pt-4 space-y-3">
                    <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Get started</p>
                    <nav className="space-y-3" role="navigation" aria-label="Get started">
                      <Link href="/auth/signin" onClick={closeMenu}>
                        <Button variant="outline" className="w-full h-14 text-base" size="lg">
                          Sign in
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={closeMenu}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 text-base" size="lg">
                          Get started
                        </Button>
                      </Link>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
