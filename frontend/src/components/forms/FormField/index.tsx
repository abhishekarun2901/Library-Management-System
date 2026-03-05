import type { ReactNode } from "react"

export type FormFieldProps = {
  label: string
  htmlFor?: string
  helperText?: string
  errorText?: string
  required?: boolean
  children: ReactNode
}

export const FormField = ({ children, errorText, helperText, htmlFor, label, required }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      {children}
      {errorText ? <p className="text-sm text-red-600">{errorText}</p> : null}
      {!errorText && helperText ? <p className="text-sm text-gray-600">{helperText}</p> : null}
    </div>
  )
}
