import type { HTMLAttributes } from "react"

type DividerOrientation = "horizontal" | "vertical"

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: DividerOrientation
}

export const Divider = ({ className = "", orientation = "horizontal", ...props }: DividerProps) => {
  if (orientation === "vertical") {
    return <span className={`inline-block h-full w-px bg-gray-200 ${className}`.trim()} aria-hidden="true" />
  }

  return <hr className={`my-4 border-gray-200 ${className}`.trim()} {...props} />
}
