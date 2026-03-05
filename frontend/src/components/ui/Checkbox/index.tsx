import type { InputHTMLAttributes, ReactNode } from "react"

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode
}

export const Checkbox = ({ className = "", label, ...props }: CheckboxProps) => {
  const checkbox = (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 accent-indigo-600 ${className}`.trim()}
      {...props}
    />
  )

  if (!label) {
    return checkbox
  }

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      {checkbox}
      <span>{label}</span>
    </label>
  )
}
