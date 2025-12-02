import type React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // <CHANGE> Enhanced skeleton with muted background and subtle primary glow animation
        "bg-muted animate-pulse rounded-md relative overflow-hidden",
        // Shimmer effect overlay
        "after:absolute after:inset-0 after:translate-x-[-100%] after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-primary/5 after:to-transparent",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
