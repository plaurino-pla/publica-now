import clsx from 'clsx'

type SkeletonProps = {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={clsx('animate-pulse rounded-md bg-gray-200', className)} />
  )
}


