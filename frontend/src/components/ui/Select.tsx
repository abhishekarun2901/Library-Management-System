import type { SelectHTMLAttributes } from "react"

export type SelectOption = {
  label: string
  value: string
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[]
  placeholder?: string
}

export const Select = ({ className = "", options, placeholder, ...props }: SelectProps) => {
  return (
    <select
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`.trim()}
      {...props}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
