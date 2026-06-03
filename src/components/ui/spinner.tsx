import { cn } from "@/lib/utils";

export function Spinner({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn("inline-block animate-spin rounded-full border-2 border-primary border-t-transparent", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function FullPageSpinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Spinner size={40} />
      <p className="font-body-md text-on-surface-variant">{label}</p>
    </div>
  );
}
