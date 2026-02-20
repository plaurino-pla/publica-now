'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FileText, LayoutDashboard, BarChart3, DollarSign, Plus } from 'lucide-react'

export function DashboardMobileTabs() {
  const pathname = usePathname()
  const items = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/articles', icon: FileText, label: 'Posts' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/earnings', icon: DollarSign, label: 'Earnings' },
    { href: '/dashboard/new', icon: Plus, label: 'New' },
  ]
  return (
    <nav className="lg:hidden sticky top-[64px] z-30 bg-white border-b border-gray-200 overflow-x-auto" aria-label="Dashboard tabs">
      <div className="flex gap-2 px-4 py-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={(item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)) ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
              (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)) ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}


