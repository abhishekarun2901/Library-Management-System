import {
  SidebarIconDashboard,
  SidebarIconCatalog,
  SidebarIconReservations,
  SidebarIconMembers,
  SidebarIconBooks,
  SidebarIconFines,
  SidebarIconActivity,
  SidebarIconReports,
  SidebarIconProfile,
} from '../components/navigation/Sidebar'

export const librarianSidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/librarian',
    icon: <SidebarIconDashboard />,
  },
  {
    id: 'books',
    label: 'Books',
    href: '/librarian/books',
    icon: <SidebarIconBooks />,
  },
  {
    id: 'reservations',
    label: 'Reservations',
    href: '/librarian/reservations',
    icon: <SidebarIconReservations />,
  },
  {
    id: 'members',
    label: 'Member Management',
    href: '/librarian/members',
    icon: <SidebarIconMembers />,
  },
  {
    id: 'fines',
    label: 'Fines & Payments',
    href: '/librarian/fines',
    icon: <SidebarIconFines />,
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/librarian/reports',
    icon: <SidebarIconReports />,
  },
  {
    id: 'profile',
    label: 'My Profile',
    href: '/librarian/profile',
    icon: <SidebarIconProfile />,
  },
]

export const memberSidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/member',
    icon: <SidebarIconDashboard />,
  },
  {
    id: 'catalog',
    label: 'Browse Catalog',
    href: '/member/catalog',
    icon: <SidebarIconCatalog />,
  },
  {
    id: 'activity',
    label: 'My Activity',
    href: '/member/activity',
    icon: <SidebarIconActivity />,
  },
  {
    id: 'profile',
    label: 'My Profile',
    href: '/member/profile',
    icon: <SidebarIconProfile />,
  },
]
