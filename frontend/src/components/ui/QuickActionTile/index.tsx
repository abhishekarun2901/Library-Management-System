import type { ButtonHTMLAttributes, ReactNode } from "react"

export type QuickActionTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title?: ReactNode
  label?: ReactNode
  description?: ReactNode
}

export const QuickActionTile = ({ className = "", description, title, label, ...props }: QuickActionTileProps) => {
  const heading = title ?? label

  return (
    <button
      className={`w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-6 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`.trim()}
      {...props}
    >
      <p className="text-base font-semibold text-gray-900">{heading}</p>
      {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
    </button>
  )
}
