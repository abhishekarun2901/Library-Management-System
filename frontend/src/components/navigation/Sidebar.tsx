import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Search,
  BookUp,
  CalendarDays,
  Users,
  Library,
  CreditCard,
  BookOpen,
  History,
  User,
  LayoutList,
} from "lucide-react"

type SidebarItem = {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  active?: boolean
}

export type SidebarProps = {
  title?: string
  items: SidebarItem[]
}

const cls = "h-4 w-4 shrink-0"

export const SidebarIconDashboard    = () => <LayoutDashboard className={cls} />
export const SidebarIconCatalog      = () => <Search          className={cls} />
export const SidebarIconIssue        = () => <BookUp          className={cls} />
export const SidebarIconReservations = () => <CalendarDays    className={cls} />
export const SidebarIconMembers      = () => <Users           className={cls} />
export const SidebarIconBooks        = () => <Library         className={cls} />
export const SidebarIconFines        = () => <CreditCard      className={cls} />
export const SidebarIconLoans        = () => <BookOpen        className={cls} />
export const SidebarIconHistory      = () => <History         className={cls} />
export const SidebarIconProfile      = () => <User            className={cls} />
export const SidebarIconActivity     = () => <LayoutList      className={cls} />

export const Sidebar = ({ title = "BooKing", items }: SidebarProps) => {
  const location = useLocation()

  return (
    <aside className="sticky top-0 h-screen w-60 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center bg-gradient-to-r from-indigo-600 to-purple-600 px-5">
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
      </div>
      <nav className="space-y-1 p-3">
        {items.map((item) => {
          const isActive = item.active ?? (item.href ? location.pathname === item.href : false)
          const classes = `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            isActive ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-700 hover:bg-gray-100"
          }`

          if (item.href) {
            return (
              <Link key={item.id} to={item.href} className={classes}>
                {item.icon}
                {item.label}
              </Link>
            )
          }

          return (
            <button key={item.id} type="button" className={classes}>
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
