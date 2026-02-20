import { cn } from '@/lib/utils'

type BadgeProps = {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const base = 'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full'
  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-white/[0.08] text-white/70',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger: 'bg-red-500/15 text-red-400',
    info: 'bg-brand-500/15 text-brand-400',
    outline: 'border border-white/[0.1] text-white/70',
  }
  return <span className={cn(base, variants[variant], className)}>{children}</span>
}


