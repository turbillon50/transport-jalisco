import { Badge, type BadgeVariant } from "@/components/ui";
import { STATUS_LABEL, type ServiceStatus } from "@/lib/mock";

const variant: Record<ServiceStatus, BadgeVariant> = {
  pendiente: "warning",
  asignado: "info",
  confirmado: "info",
  en_curso: "info",
  completado: "success",
  cancelado: "danger",
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return <Badge variant={variant[status]}>{STATUS_LABEL[status]}</Badge>;
}
