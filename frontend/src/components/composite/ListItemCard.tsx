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
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-semibold text-gray-900">{title}</h4>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-600 break-words">{subtitle}</p>
          ) : null}
          {meta ? (
            <p className="mt-2 text-xs text-gray-600 break-words">{meta}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardContent>
    </Card>
  )
}
