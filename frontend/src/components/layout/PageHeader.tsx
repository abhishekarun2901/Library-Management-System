import type { HTMLAttributes, ReactNode } from "react"

export type PageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export const PageHeader = ({ action, className = "", description, title, ...props }: PageHeaderProps) => {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()} {...props}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
