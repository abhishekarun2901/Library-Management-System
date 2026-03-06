import type { HTMLAttributes } from "react"

export type AvatarProps = HTMLAttributes<HTMLDivElement>

export const Avatar = ({ className = "", ...props }: AvatarProps) => {
  return (
    <div
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-500 ${className}`.trim()}
      aria-label="Avatar"
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.314 0-6 2.015-6 4.5V20h12v-1.5c0-2.485-2.686-4.5-6-4.5Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
