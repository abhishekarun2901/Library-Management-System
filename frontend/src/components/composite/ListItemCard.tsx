import type { HTMLAttributes, ReactNode } from "react"
import { Card, CardContent } from "../ui"

export type ListItemCardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  action?: ReactNode
}

export const ListItemCard = ({ action, className = "", meta, subtitle, title, ...props }: ListItemCardProps) => {
  return (
    <Card className={className} {...props}>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900">{title}</h4>
          {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
          {meta ? <p className="mt-2 text-xs text-gray-600">{meta}</p> : null}
        </div>
        {action}
      </CardContent>
    </Card>
  )
}
