import type { ImgHTMLAttributes } from "react"

export type AvatarProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string
}

export const Avatar = ({ alt = "Avatar", className = "", src, ...props }: AvatarProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`h-10 w-10 rounded-full border border-gray-200 bg-gray-100 object-cover ${className}`.trim()}
      {...props}
    />
  )
}
