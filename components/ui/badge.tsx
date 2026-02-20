import clsx from 'clsx'

type BadgeProps = {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const base = 'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full'
  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-800',
  }
  return <span className={clsx(base, variants[variant], className)}>{children}</span>
}


