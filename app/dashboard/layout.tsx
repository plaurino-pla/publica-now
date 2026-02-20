import { ReactNode } from 'react'
import { Container } from '@/components/ui/container'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardMobileTabs } from '@/components/dashboard/mobile-tabs'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-0">
      <Container className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <DashboardSidebar />
            </div>
          </div>
          <div className="min-w-0">
            <DashboardMobileTabs />
            {children}
          </div>
        </div>
      </Container>
    </div>
  )
}


