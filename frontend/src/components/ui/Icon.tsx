import type { HTMLAttributes, ReactNode } from 'react'

type IconSize = 'sm' | 'md' | 'lg'

export type IconProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  size?: IconSize
}

const sizeClasses: Record<IconSize, string> = {
  sm: 'h-4 w-4 text-sm',
  md: 'h-5 w-5 text-base',
  lg: 'h-6 w-6 text-lg',
}

export const Icon = ({
  children,
  size = 'md',
  className = '',
  ...props
}: IconProps) => {
  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`.trim()}
      aria-hidden="true"
      {...props}
    >
      {children}
    </span>
  )
}
