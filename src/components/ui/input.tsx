"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

type InputProps = {
  label?: string;
  error?: string;
  hint?: string;
  /** Material Symbol name shown inside the field. */
  icon?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, className = "", id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <Icon name={icon} className="text-[20px]" />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-10 rounded-lg border bg-[var(--color-surface)] text-[var(--color-text)] px-3 text-sm transition-colors placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
            error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]",
            icon && "pl-10",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  );
});

type TextareaProps = {
  label?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, className = "", id, ...props },
  ref,
) {
  const autoId = useId();
  const taId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={taId} className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={taId}
        className={cn(
          "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] px-3 py-2.5 text-sm transition-colors placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none",
          className,
        )}
        {...props}
      />
    </div>
  );
});
