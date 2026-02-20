import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-2 text-base sm:text-lg">{subtitle}</p>}
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}


