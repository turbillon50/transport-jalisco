import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]",
  success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        badgeStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
