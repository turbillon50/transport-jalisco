import { Badge } from "@/components/ui";
import { STATUS_LABEL, type ServiceStatus } from "@/lib/mock";

const tone: Record<ServiceStatus, "primary" | "secondary" | "success" | "warning" | "error" | "neutral"> = {
  pendiente: "warning",
  asignado: "secondary",
  confirmado: "secondary",
  en_curso: "primary",
  completado: "success",
  cancelado: "error",
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <Badge tone={tone[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
