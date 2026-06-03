"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-110 shadow-sm",
  secondary: "bg-secondary-container text-on-secondary hover:bg-secondary shadow-sm",
  outline: "border border-primary text-primary hover:bg-primary-fixed",
  ghost: "text-on-surface-variant hover:bg-surface-container",
  danger: "bg-error text-on-error hover:brightness-110 shadow-sm",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-label-md",
  md: "h-11 px-5 text-label-lg",
  lg: "h-14 px-6 text-label-lg",
};

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconFill?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, iconFill, loading, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-label-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <Icon name={icon} fill={iconFill} className="text-[20px]" />
      )}
      {children}
    </motion.button>
  );
});
