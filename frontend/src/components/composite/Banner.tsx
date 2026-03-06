import type { HTMLAttributes, ReactNode } from "react"
import { Badge, Card, CardContent } from "../ui"

type BannerVariant = "info" | "success" | "warning" | "danger"

export type BannerProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  description?: ReactNode
  variant?: BannerVariant
  onClose?: () => void
}

const variantToBadge: Record<BannerVariant, { label: string; variant: "issued" | "available" | "reserved" | "overdue" }> = {
  info: { label: "Info", variant: "issued" },
  success: { label: "Success", variant: "available" },
  warning: { label: "Warning", variant: "reserved" },
  danger: { label: "Alert", variant: "overdue" }
}

export const Banner = ({ className = "", description, onClose, title, variant = "info", ...props }: BannerProps) => {
  const badge = variantToBadge[variant]

  return (
    <Card className={className} {...props}>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge label={badge.label} variant={badge.variant} />
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
