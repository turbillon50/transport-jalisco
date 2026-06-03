import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "success" | "warning" | "error" | "neutral";

const tones: Record<Tone, string> = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-container/10 text-secondary",
  success: "bg-green-100 text-green-800 border border-green-200",
  warning: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
