import type { HTMLAttributes, ReactNode } from "react"

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export const Card = ({ children, className = "", ...props }: CardProps) => {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = "", ...props }: CardSectionProps) => {
  return (
    <div className={`border-b border-gray-200 px-6 py-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export const CardContent = ({ children, className = "", ...props }: CardSectionProps) => {
  return (
    <div className={`p-6 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export const CardFooter = ({ children, className = "", ...props }: CardSectionProps) => {
  return (
    <div className={`border-t border-gray-200 px-6 py-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
