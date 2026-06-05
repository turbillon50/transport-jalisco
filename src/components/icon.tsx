import { cn } from "@/lib/utils";

export function Icon({
  name,
  fill,
  className,
  style,
}: {
  name: string;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn("material-symbols-outlined inline-block overflow-hidden w-[1em] h-[1em] leading-none", fill && "fill", className)}
      style={style}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
