'use client'

import Link from 'next/link'
import { User, LogOut, ChevronDown, FileText, Mic, Image, Video, Settings } from 'lucide-react'
import { signOut } from 'next-auth/react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const contentTypes = [
  { type: 'text', label: 'Text post', icon: FileText, href: '/dashboard/new' },
  { type: 'audio', label: 'Audio post', icon: Mic, href: '/dashboard/new/audio' },
  { type: 'image', label: 'Image post', icon: Image, href: '/dashboard/new/image' },
  { type: 'video', label: 'Video post', icon: Video, href: '/dashboard/new/video' },
]

export function UserMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 text-white/70 hover:text-white rounded-md px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center">
            <User className="h-4 w-4 text-white/50" />
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-56 bg-surface-1 border border-white/[0.08] rounded-lg shadow-2xl z-50 py-1 animate-scale-in"
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/dashboard/account"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/[0.06] outline-none cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-white/40" />
              My Account
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-white/[0.06] my-1" />

          <DropdownMenu.Label className="px-4 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wide">
            Create Content
          </DropdownMenu.Label>
          {contentTypes.map((ct) => {
            const Icon = ct.icon
            return (
              <DropdownMenu.Item key={ct.type} asChild>
                <Link
                  href={ct.href}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/[0.06] outline-none cursor-pointer transition-colors"
                >
                  <Icon className="w-4 h-4 text-white/40" />
                  {ct.label}
                </Link>
              </DropdownMenu.Item>
            )
          })}

          <DropdownMenu.Separator className="h-px bg-white/[0.06] my-1" />

          <DropdownMenu.Item
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 outline-none cursor-pointer transition-colors"
            onSelect={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
