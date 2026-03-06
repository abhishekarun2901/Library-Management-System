import type { HTMLAttributes, ReactNode } from "react"

export type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export const PageContainer = ({ children, className = "", ...props }: PageContainerProps) => {
  return (
    <div className={`mx-auto w-full max-w-7xl p-6 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
