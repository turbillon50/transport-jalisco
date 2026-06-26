import { cn } from "@/lib/utils";
type AlertType = "success" | "warning" | "error" | "info";
const alertConfig: Record<AlertType, { icon: string; styles: string }> = {
  success: { icon: "check_circle", styles: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200" },
  warning: { icon: "warning", styles: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200" },
  error: { icon: "cancel", styles: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200" },
  info: { icon: "info", styles: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200" },
};
export function Alert({ type = "info", title, message, children, onDismiss, onClose, className }: {
  type?: AlertType; title?: string; message?: string; children?: React.ReactNode;
  onDismiss?: () => void; onClose?: () => void; className?: string;
}) {
  const { icon, styles } = alertConfig[type];
  const body = children ?? message;
  const dismiss = onDismiss ?? onClose;
  return (
    <div className={cn("flex gap-3 p-4 rounded-xl border", styles, className)}>
      <span className="material-symbols-rounded text-[20px] shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        {body && <p className="text-sm opacity-90">{body}</p>}
      </div>
      {dismiss && (
        <button onClick={dismiss} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
          <span className="material-symbols-rounded text-[18px]">close</span>
        </button>
      )}
    </div>
  );
}
