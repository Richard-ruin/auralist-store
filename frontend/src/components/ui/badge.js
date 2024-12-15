// src/components/ui/badge.js
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils" // Perbaiki import path

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: 
          "text-foreground",
        success: 
          "border-transparent bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
        warning: 
          "border-transparent bg-amber-50 text-amber-600 hover:bg-amber-100",
        info: 
          "border-transparent bg-sky-50 text-sky-600 hover:bg-sky-100",
        error: 
          "border-transparent bg-red-50 text-red-600 hover:bg-red-100",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }