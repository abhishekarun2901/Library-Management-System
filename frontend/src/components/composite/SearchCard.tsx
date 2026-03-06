import type { HTMLAttributes, ReactNode } from "react"
import { Card, CardContent, CardHeader } from "../ui"

export type SearchCardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export const SearchCard = ({ action, children, className = "", description, title, ...props }: SearchCardProps) => {
  return (
    <Card className={className} {...props}>
      {title || action ? (
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-gray-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
          </div>
          {action}
        </CardHeader>
      ) : null}
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}
