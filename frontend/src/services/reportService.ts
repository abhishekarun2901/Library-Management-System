import { apiFetch } from '../lib/apiClient'

export type ReportResponse = {
  totalInventory: number
  totalFineRevenue: number
  topBorrowedBooks: Array<{ title: string; borrowCount: number }>
  mostActiveUsers: Array<{ email: string; borrowCount: number }>
  totalOutstandingFines: number
  overdueCount: number
  lostCount: number
}

export const getReports = (token: string) =>
  apiFetch<ReportResponse>('/v1/reports', {}, token)
