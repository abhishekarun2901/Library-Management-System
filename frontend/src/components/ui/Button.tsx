import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonVariant = "primary" | "secondary" | "danger"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700",
  secondary: "bg-white text-gray-900 border-gray-200 hover:bg-gray-50",
  danger: "bg-red-500 text-white border-red-500 hover:bg-red-600"
}

export const Button = ({ children, className = "", variant = "primary", ...props }: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
