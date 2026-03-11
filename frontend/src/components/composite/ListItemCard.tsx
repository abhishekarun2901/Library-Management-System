import type { HTMLAttributes, ReactNode } from 'react'
import { Card, CardContent } from '../ui'

export type ListItemCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  action?: ReactNode
}

export const ListItemCard = ({
  action,
  className = '',
  meta,
  subtitle,
  title,
  ...props
}: ListItemCardProps) => {
  return (
    <Card className={className} {...props}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 overflow-hidden">
          <h4 className="truncate text-base font-semibold text-gray-900">
            {title}
          </h4>
          {subtitle ? (
            <p className="mt-1 truncate text-sm text-gray-600">{subtitle}</p>
          ) : null}
          {meta ? (
            <p className="mt-1 truncate text-xs text-gray-500">{meta}</p>
          ) : null}
        </div>
        {action ? (
          <div className="w-full sm:w-auto sm:shrink-0">{action}</div>
        ) : null}
      </CardContent>
    </Card>
  )
}
