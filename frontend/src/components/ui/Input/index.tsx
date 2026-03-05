import type { InputHTMLAttributes } from "react"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = ({ className = "", type = "text", ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`.trim()}
      {...props}
    />
  )
}
