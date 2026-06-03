"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({
  children,
  hover = false,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2, boxShadow: "var(--shadow-lg)" } : undefined}
      className={cn(
        "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-[var(--shadow-sm)]",
        hover && "cursor-pointer",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-[var(--text-lg)] font-semibold text-[var(--color-text)]">{title}</h3>
        {subtitle && <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
