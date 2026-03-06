import type { TextareaHTMLAttributes } from "react"

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = ({ className = "", rows = 4, ...props }: TextareaProps) => {
  return (
    <textarea
      rows={rows}
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`.trim()}
      {...props}
    />
  )
}
