import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export function Stars({ value, size = 16, className }: { value: number | null; size?: number; className?: string }) {
  const v = value ?? 0;
  return (
    <span className={cn("inline-flex items-center", className)} aria-label={`${v} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          fill={i < Math.round(v)}
          className={cn(i < Math.round(v) ? "text-tertiary-fixed-dim" : "text-outline-variant")}
          style={{ fontSize: size }}
        />
      ))}
    </span>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
        <Icon name={icon} className="text-3xl text-outline" />
      </div>
      <h3 className="text-headline-sm font-semibold text-on-surface">{title}</h3>
      {body && <p className="text-body-md text-on-surface-variant max-w-sm mt-1">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
