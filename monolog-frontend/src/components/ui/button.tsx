import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-blue hover:bg-primary-hover active:scale-[0.98]",
        secondary:
          "bg-surface-muted text-surface-on border border-border hover:border-primary/40 hover:bg-primary/5",
        ghost:
          "text-text-muted hover:text-surface-on hover:bg-surface-muted",
        outline:
          "border border-border bg-white dark:bg-surface-muted text-surface-on hover:border-primary/40 hover:bg-primary/5",
        destructive:
          "bg-error text-white hover:bg-error/90",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-3.5 py-1.5 text-xs",
        lg:      "h-12 px-7 py-3 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
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
