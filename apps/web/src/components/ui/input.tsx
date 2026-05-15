import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-soraku-secondary/20 bg-soraku-dark/60 px-3 py-2 text-sm text-soraku-light ring-offset-soraku-dark file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-soraku-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soraku-primary focus-visible:ring-offset-2 focus-visible:border-soraku-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };