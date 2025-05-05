import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  src?: string
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ name, src, className, ...props }, ref) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : ''
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-sm",
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
})
Avatar.displayName = "Avatar" 