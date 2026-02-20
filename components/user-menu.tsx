'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, LogOut, ChevronDown, FileText, Mic, Image, Video, Settings } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'

export function UserMenu() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const contentTypes = [
    { type: 'text', label: 'Text post', icon: FileText, href: '/dashboard/new' },
    { type: 'audio', label: 'Audio post', icon: Mic, href: '/dashboard/new/audio' },
    { type: 'image', label: 'Image post', icon: Image, href: '/dashboard/new/image' },
    { type: 'video', label: 'Video post', icon: Video, href: '/dashboard/new/video' },
  ]

  return (
    <div className="flex items-center gap-2">
      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-2">
              {/* Profile & Account */}
              <Link href="/dashboard/account">
                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">My Account</span>
                </button>
              </Link>
              
              {/* Divider */}
              <div className="border-t my-2"></div>
              
              {/* Create Content Options */}
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Create Content</p>
                {contentTypes.map((contentType) => {
                  const IconComponent = contentType.icon
                  return (
                    <Link key={contentType.type} href={contentType.href}>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors rounded"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <IconComponent className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">{contentType.label}</span>
                      </button>
                    </Link>
                  )
                })}
              </div>
              
              {/* Divider */}
              <div className="border-t my-2"></div>
              
              {/* Sign out */}
              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors text-red-600 hover:text-red-700"
                onClick={() => {
                  setIsDropdownOpen(false)
                  signOut({ callbackUrl: '/' })
                }}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
