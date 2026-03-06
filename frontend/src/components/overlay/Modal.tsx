import type { ReactNode } from "react"
import { Button, Card, CardContent, CardFooter, CardHeader } from "../ui"

export type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose?: () => void
  primaryAction?: ReactNode
}

export const Modal = ({ children, onClose, open, primaryAction, title }: ModalProps) => {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {primaryAction}
        </CardFooter>
      </Card>
    </div>
  )
}
