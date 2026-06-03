"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, icon, error, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="space-y-base">
      {label && (
        <label htmlFor={inputId} className="font-label-lg text-label-lg text-on-surface-variant block">
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative flex items-center bg-surface-container-lowest border rounded-lg p-3 transition-all group focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary",
          error ? "border-error" : "border-outline-variant",
        )}
      >
        {icon && (
          <Icon name={icon} className="text-outline group-focus-within:text-secondary pr-2" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border-none p-0 outline-none font-body-md text-on-surface placeholder:text-outline-variant",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-label-md text-error">{error}</p>}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  function Textarea({ label, className, id, ...props }, ref) {
    const autoId = useId();
    const ta = id ?? autoId;
    return (
      <div className="space-y-base">
        {label && (
          <label htmlFor={ta} className="font-label-lg text-label-lg text-on-surface-variant block">
            {label}
          </label>
        )}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all">
          <textarea
            ref={ref}
            id={ta}
            className={cn(
              "w-full bg-transparent border-none p-0 outline-none font-body-md text-on-surface placeholder:text-outline-variant resize-none",
              className,
            )}
            {...props}
          />
        </div>
      </div>
    );
  },
);
