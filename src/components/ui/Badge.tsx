import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.ComponentProps<"div"> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-max",
        {
          "border-transparent bg-primary-600 text-primary-foreground shadow": variant === "default",
          "border-transparent bg-slate-100 text-slate-900": variant === "secondary",
          "border-transparent bg-rose-100 text-rose-800": variant === "destructive",
          "border-transparent bg-emerald-100 text-emerald-800": variant === "success",
          "border-transparent bg-amber-100 text-amber-800": variant === "warning",
          "border-transparent bg-cyan-100 text-cyan-800": variant === "info",
          "text-slate-950 border-slate-300": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
