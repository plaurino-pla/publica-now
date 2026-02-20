import { cn } from '@/lib/utils'

type SkeletonProps = {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-stone-200', className)} />
  )
}


