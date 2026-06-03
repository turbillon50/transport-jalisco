import { cn } from "@/lib/utils";

export function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn(
        "animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]",
        s[size],
        className,
      )}
    />
  );
}

export function FullPageSpinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
