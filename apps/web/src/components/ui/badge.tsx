import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-soraku-primary text-white",
        secondary: "bg-soraku-secondary/20 text-soraku-light",
        destructive: "bg-red-500/90 text-white",
        accent: "bg-soraku-accent text-soraku-dark",
        outline: "border border-soraku-secondary/30 text-soraku-light",
        airing: "badge-airing",
        completed: "bg-soraku-secondary/30 text-soraku-light",
        upcoming: "bg-soraku-accent/20 text-soraku-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };