import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soraku-primary focus-visible:ring-offset-2 focus-visible:ring-offset-soraku-dark disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-soraku-primary text-white hover:bg-soraku-primary/90 shadow-lg shadow-soraku-primary/20",
        destructive: "bg-red-500/90 text-white hover:bg-red-500/80",
        outline: "border border-soraku-secondary/30 bg-transparent text-soraku-light hover:bg-soraku-secondary/20 hover:border-soraku-primary/50",
        secondary: "bg-soraku-secondary/20 text-soraku-light hover:bg-soraku-secondary/30",
        ghost: "text-soraku-light hover:bg-soraku-secondary/20",
        accent: "bg-soraku-accent text-soraku-dark hover:bg-soraku-accent/90",
        glass: "glass text-soraku-light hover:bg-soraku-secondary/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };