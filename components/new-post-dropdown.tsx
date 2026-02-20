'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDown, FileText, Mic, Image, Video } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface NewPostDropdownProps {
  size?: 'sm' | 'lg'
  variant?: 'default' | 'blue'
}

export function NewPostDropdown({ size = 'lg', variant = 'default' }: NewPostDropdownProps) {
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
    { type: 'text', label: 'Text post', icon: FileText, href: '/dashboard/new/text' },
    { type: 'audio', label: 'Audio post', icon: Mic, href: '/dashboard/new/audio' },
    { type: 'image', label: 'Image post', icon: Image, href: '/dashboard/new/image' },
    { type: 'video', label: 'Video post', icon: Video, href: '/dashboard/new/video' },
  ]

  const buttonClasses = variant === 'blue' 
    ? 'bg-brand-600 hover:bg-brand-700 text-white'
    : 'bg-black hover:bg-gray-800 text-white'

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        size={size}
        className={`${buttonClasses} flex items-center gap-2`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Plus className="w-4 h-4" />
        <span>New post</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {contentTypes.map((contentType) => {
              const IconComponent = contentType.icon
              return (
                <Link key={contentType.type} href={contentType.href}>
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">{contentType.label}</span>
                  </button>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
