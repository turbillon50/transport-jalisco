"use client";
import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant; size?: Size; loading?: boolean;
  icon?: string; iconEnd?: string; iconFill?: boolean;
  fullWidth?: boolean; children?: React.ReactNode;
}
const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90",
  secondary: "bg-secondary text-on-secondary hover:opacity-90",
  outline: "border border-outline text-on-surface hover:bg-surface-container",
  ghost: "text-on-surface hover:bg-surface-container",
  danger: "bg-error text-on-error hover:opacity-90",
};
const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-label-sm gap-1",
  md: "h-10 px-4 text-label-md gap-2",
  lg: "h-12 px-6 text-label-lg gap-2",
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, iconEnd, iconFill, fullWidth, children, className, disabled, ...props }, ref) => {
    return (
      <motion.button ref={ref} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.15 }} disabled={disabled || loading}
        className={cn("inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)} {...props}>
        {loading ? (<span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (<Icon name={icon} fill={iconFill} className="text-[18px]" />) : null}
        {children}
        {iconEnd && !loading && <Icon name={iconEnd} fill={iconFill} className="text-[18px]" />}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
