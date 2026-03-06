import type { ReactNode } from "react"
import { Avatar } from "../ui"

export type TopbarProps = {
  title?: ReactNode
  userName?: string
}

export const Topbar = ({ title = "Librarian Dashboard", userName = "Librarian" }: TopbarProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-6 shadow-sm">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-indigo-200">{userName}</span>
        <Avatar />
      </div>
    </header>
  )
}
