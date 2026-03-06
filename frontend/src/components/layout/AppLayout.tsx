import type { ReactNode } from "react"
import { Sidebar, type SidebarProps, Topbar } from "../navigation"

export type AppLayoutProps = {
  children: ReactNode
  sidebarItems: SidebarProps["items"]
  topbarTitle?: ReactNode
}

export const AppLayout = ({ children, sidebarItems, topbarTitle }: AppLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Sidebar items={sidebarItems} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={topbarTitle} />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
