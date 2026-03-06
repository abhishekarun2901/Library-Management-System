import type { ReactNode } from "react"

export type BadgeVariant = "available" | "reserved" | "issued" | "overdue" | "pending" | "ready"

export type BadgeProps = {
  label: ReactNode
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-yellow-100 text-yellow-700",
  issued: "bg-indigo-100 text-indigo-700",
  overdue: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  ready: "bg-green-100 text-green-700"
}

export const Badge = ({ label, variant = "available" }: BadgeProps) => {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${variantClasses[variant]}`}>{label}</span>
}
