import type { HTMLAttributes, ReactNode } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "../ui"

export type FormCardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export const FormCard = ({ children, className = "", description, footer, title, ...props }: FormCardProps) => {
  return (
    <Card className={`mx-auto max-w-xl ${className}`.trim()} {...props}>
      {title || description ? (
        <CardHeader>
          {title ? <h2 className="text-xl font-semibold text-gray-900">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
        </CardHeader>
      ) : null}

      <CardContent className="space-y-4">{children}</CardContent>

      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}
