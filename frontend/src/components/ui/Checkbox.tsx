import type { InputHTMLAttributes } from 'react'

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label?: string
}

export const Checkbox = ({
  label,
  className = '',
  id,
  ...props
}: CheckboxProps) => {
  const inputId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <label
      className="inline-flex items-center gap-2 cursor-pointer select-none"
      htmlFor={inputId}
    >
      <input
        id={inputId}
        type="checkbox"
        className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${className}`.trim()}
        {...props}
      />
      {label ? <span className="text-sm text-gray-700">{label}</span> : null}
    </label>
  )
}
