import type { HTMLAttributes } from "react"

type SpinnerSize = "sm" | "md" | "lg"

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: SpinnerSize
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-4",
  lg: "h-8 w-8 border-4"
}

export const Spinner = ({ className = "", size = "md", ...props }: SpinnerProps) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    />
  )
}
