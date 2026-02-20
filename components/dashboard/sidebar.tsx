'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FileText, LayoutDashboard, BarChart3, DollarSign } from 'lucide-react'

export function DashboardSidebar() {
  const pathname = usePathname()
  const items = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/articles', icon: FileText, label: 'Posts' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/earnings', icon: DollarSign, label: 'Earnings' },
  ]
  return (
    <nav aria-label="Dashboard" className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
            pathname.startsWith(item.href) ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <item.icon className="w-4 h-4" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}


