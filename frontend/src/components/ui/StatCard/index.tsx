import type { HTMLAttributes, ReactNode } from "react"

export type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode
  title?: ReactNode
  value: ReactNode
}

export const StatCard = ({ className = "", label, title, value, ...props }: StatCardProps) => {
  const heading = label ?? title

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`.trim()} {...props}>
      <p className="text-sm text-gray-600">{heading}</p>
      <h3 className="mt-1 text-2xl font-semibold text-gray-900">{value}</h3>
    </div>
  )
}
