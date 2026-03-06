import type { HTMLAttributes, ReactNode } from "react"

type IconSize = "sm" | "md" | "lg"

export type IconProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  size?: IconSize
}

const sizeClasses: Record<IconSize, string> = {
  sm: "h-4 w-4 text-sm",
  md: "h-5 w-5 text-base",
  lg: "h-6 w-6 text-lg"
}

export const Icon = ({ children, className = "", size = "md", ...props }: IconProps) => {
  return (
    <span aria-hidden="true" className={`inline-flex items-center justify-center text-gray-700 ${sizeClasses[size]} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}
