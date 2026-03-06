import type { HTMLAttributes, ReactNode } from "react"
import { Card, CardContent } from "../ui"

export type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode
  title?: ReactNode
  value: ReactNode
}

export const StatCard = ({ className = "", label, title, value, ...props }: StatCardProps) => {
  const heading = label ?? title

  return (
    <Card className={className} {...props}>
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">{heading}</p>
        <h3 className="mt-1 text-2xl font-semibold text-gray-900">{value}</h3>
      </CardContent>
    </Card>
  )
}
