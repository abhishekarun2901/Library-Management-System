import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sidebar, type SidebarProps, Topbar } from '../navigation'
import styles from '../../styles/responsive.module.css'
import { useAuthStore } from '../../store/authStore'

export type AppLayoutProps = {
  children: ReactNode
  sidebarItems: SidebarProps['items']
  topbarTitle?: ReactNode
  userName?: string
}

export const AppLayout = ({
  children,
  sidebarItems,
  topbarTitle,
  userName,
}: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const storeFullName = useAuthStore((s) => s.fullName)
  const resolvedName = userName ?? storeFullName ?? 'User'

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {sidebarOpen && (
        <div
          role="presentation"
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar items={sidebarItems} isOpen={sidebarOpen} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          title={topbarTitle}
          userName={resolvedName}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
