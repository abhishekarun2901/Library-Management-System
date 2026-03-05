import type { HTMLAttributes, ReactNode } from "react"

export type FormCardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
}

export const FormCard = ({ children, className = "", description, title, ...props }: FormCardProps) => {
  return (
    <div className={`mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`.trim()} {...props}>
      {title ? <h2 className="text-xl font-semibold text-gray-900">{title}</h2> : null}
      {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      <div className={title || description ? "mt-6 space-y-4" : "space-y-4"}>{children}</div>
    </div>
  )
}
