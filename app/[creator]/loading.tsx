'use client'

import Skeleton from '@/components/ui/skeleton'

export default function CreatorLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start gap-6 mb-8">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1">
              <Skeleton className="w-48 h-8 mb-2" />
              <Skeleton className="w-32 h-4 mb-4" />
              <Skeleton className="w-full h-16" />
              <div className="flex gap-3 mt-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 border-b border-gray-200">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>

      {/* Feed skeleton */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>

        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-gray-100 pb-8">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-20 mb-2" />
                </div>
              </div>
              <div className="ml-16">
                <Skeleton className="h-48 w-full max-w-2xl rounded-lg mb-4" />
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full max-w-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


