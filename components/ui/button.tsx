import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#FAFAFA] text-[#080808] hover:bg-white",
        gradient: "bg-brand-500 text-white hover:bg-brand-400", // kept name for backwards comp, but removed gradient
        secondary: "bg-[#080808] text-[#FAFAFA] border border-white/[0.1] hover:bg-white/[0.05]",
        ghost: "hover:bg-white/[0.05] text-white/70 hover:text-white",
        outline: "border border-white/[0.1] text-white/80 hover:bg-white/[0.05] hover:border-white/[0.2]",
        destructive: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
        link: "text-white/70 underline-offset-4 hover:underline hover:text-white",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs tracking-wider",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
        pill: "h-11 px-6", // Kept name for comp but no pill shape
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
