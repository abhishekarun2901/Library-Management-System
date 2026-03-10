import type { ReactNode } from "react"
import { AppLayout } from "./AppLayout"
import { PageContainer } from "./PageContainer"

export type DashboardLayoutProps = {
  children: ReactNode
}

const defaultItems = [
  { id: "dashboard", label: "Dashboard", active: true },
  { id: "catalog", label: "Catalog Search" },
  { id: "issue", label: "Issue Books" },
  { id: "reservations", label: "Reservations" },
  { id: "members", label: "Member Management" },
  { id: "books", label: "Book Management" },
  { id: "fines", label: "Fines & Payments" }
]

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <AppLayout sidebarItems={defaultItems} topbarTitle="Librarian Dashboard">
      <PageContainer>{children}</PageContainer>
    </AppLayout>
  )
}
