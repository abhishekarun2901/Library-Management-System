import {
  SidebarIconDashboard,
  SidebarIconCatalog,
  SidebarIconIssue,
  SidebarIconReservations,
  SidebarIconMembers,
  SidebarIconBooks,
  SidebarIconFines,
  SidebarIconActivity,
} from "../components/navigation/Sidebar"

export const librarianSidebarItems = [
  { id: "dashboard",    label: "Dashboard",         href: "/librarian",              icon: <SidebarIconDashboard /> },
  { id: "catalog",      label: "Catalog Search",    href: "/librarian/catalog",      icon: <SidebarIconCatalog /> },
  { id: "issue",        label: "Issue Books",       href: "/librarian/issue",        icon: <SidebarIconIssue /> },
  { id: "reservations", label: "Reservations",      href: "/librarian/reservations", icon: <SidebarIconReservations /> },
  { id: "members",      label: "Member Management", href: "/librarian/members",      icon: <SidebarIconMembers /> },
  { id: "books",        label: "Book Management",   href: "/librarian/books",        icon: <SidebarIconBooks /> },
  { id: "fines",        label: "Fines & Payments",  href: "/librarian/fines",        icon: <SidebarIconFines /> },
]

export const memberSidebarItems = [
  { id: "dashboard", label: "Dashboard",      href: "/member",          icon: <SidebarIconDashboard /> },
  { id: "catalog",   label: "Browse Catalog", href: "/member/catalog",   icon: <SidebarIconCatalog /> },
  { id: "activity",  label: "My Activity",    href: "/member/activity",  icon: <SidebarIconActivity /> },
]
