import { CheckCircle, AlertTriangle, XCircle, Info, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "success" | "warning" | "error" | "info";

const alertConfig: Record<AlertType, { icon: LucideIcon; styles: string }> = {
  success: { icon: CheckCircle, styles: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200" },
  warning: { icon: AlertTriangle, styles: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200" },
  error: { icon: XCircle, styles: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200" },
  info: { icon: Info, styles: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200" },
};

export function Alert({
  type = "info",
  title,
  message,
  children,
  onClose,
  className = "",
}: {
  type?: AlertType;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  const { icon: Icon, styles } = alertConfig[type];
  return (
    <div className={cn("flex gap-3 p-4 rounded-xl border", styles, className)} role="alert">
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm">{title}</p>}
        <p className="text-sm opacity-90">{message ?? children}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0" aria-label="Cerrar">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
