import type { HTMLAttributes, ReactNode } from "react"

export type SearchCardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export const SearchCard = ({ action, children, className = "", description, title, ...props }: SearchCardProps) => {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`.trim()} {...props}>
      {title || action ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-gray-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={title || action ? "mt-4 space-y-4" : "space-y-4"}>{children}</div>
    </div>
  )
}
