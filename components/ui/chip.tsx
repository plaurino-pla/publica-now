import clsx from 'clsx'

type ChipProps = {
  children: React.ReactNode
  leadingIcon?: React.ReactNode
  variant?: 'neutral' | 'brand' | 'outline'
  className?: string
  size?: 'sm' | 'md'
}

export default function Chip({ children, leadingIcon, variant = 'neutral', className, size = 'sm' }: ChipProps) {
  const base = 'inline-flex items-center gap-1 rounded-full'
  const sizes: Record<NonNullable<ChipProps['size']>, string> = {
    sm: 'text-xs px-2 h-6',
    md: 'text-sm px-3 h-7',
  }
  const variants: Record<NonNullable<ChipProps['variant']>, string> = {
    neutral: 'bg-gray-100 text-gray-800',
    brand: 'bg-blue-600 text-white',
    outline: 'border border-gray-300 text-gray-800',
  }
  return (
    <span className={clsx(base, sizes[size], variants[variant], className)}>
      {leadingIcon}
      {children}
    </span>
  )
}


