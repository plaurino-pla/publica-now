import { ReactNode } from 'react'
import { Container } from '@/components/ui/container'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="bg-surface-0 border-b border-white/[0.06]">
      <Container>
        <div className="py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#FAFAFA]">{title}</h1>
              {subtitle && <p className="text-white/50 mt-2 text-base sm:text-lg">{subtitle}</p>}
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>
      </Container>
    </div>
  )
}


