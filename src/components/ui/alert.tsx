import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

type Tone = "info" | "success" | "warning" | "error";

const config: Record<Tone, { cls: string; icon: string }> = {
  info: { cls: "bg-secondary-container/10 text-secondary border-secondary/30", icon: "info" },
  success: { cls: "bg-green-50 text-green-800 border-green-200", icon: "check_circle" },
  warning: { cls: "bg-tertiary-fixed/40 text-on-tertiary-fixed-variant border-tertiary-fixed-dim", icon: "warning" },
  error: { cls: "bg-error-container text-on-error-container border-error/30", icon: "error" },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const c = config[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", c.cls, className)} role="alert">
      <Icon name={c.icon} fill className="text-[20px] shrink-0" />
      <div className="flex-1">
        {title && <p className="font-label-lg text-label-lg">{title}</p>}
        {children && <p className="font-body-md text-body-md opacity-90">{children}</p>}
      </div>
    </div>
  );
}
