import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, Icon } from "../ui"

export type QuickActionTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title?: ReactNode
  label?: ReactNode
  description?: ReactNode
  href?: string
}

export const QuickActionTile = ({ className = "", description, title, label, href, ...props }: QuickActionTileProps) => {
  const heading = title ?? label

  const content = (
    <Card className="transition-colors hover:bg-gray-50">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-base font-semibold text-gray-900">{heading}</p>
          {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
        </div>
        <Icon size="lg">→</Icon>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link
        to={href}
        className={`block w-full rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`.trim()}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      className={`w-full cursor-pointer rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`.trim()}
      {...props}
    >
      {content}
    </button>
  )
}
