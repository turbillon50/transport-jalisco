import type { Metadata } from "next";
import { getUnassignedServices, getDriversAdmin } from "@/lib/queries";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { Icon } from "@/components/icon";
import { AssignDriverClient } from "@/components/admin/assign-driver-client";

export const metadata: Metadata = { title: "Traslados" };
export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pendiente: "text-amber-500", asignado: "text-blue-500", confirmado: "text-cyan-500",
  en_curso: "text-green-500", completado: "text-gray-400", cancelado: "text-red-500",
};

export default async function TrasladosPage() {
  const [services, drivers] = await Promise.all([getUnassignedServices(), getDriversAdmin()]);
  return (
    <PageTransition>
      <PageHeader title="Traslados" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto space-y-lg">
        <StaggerContainer className="space-y-3">
          {services.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <Icon name="task_alt" className="text-[48px] mb-3 opacity-40" />
              <p className="text-title-md">Sin traslados pendientes</p>
            </div>
          ) : services.map((s: any) => (
            <StaggerItem key={s.id}>
              <HoverCard lift={-2} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-label-sm font-semibold uppercase tracking-wider ${STATUS_COLORS[s.status] ?? "text-on-surface-variant"}`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="trip_origin" className="text-[16px] text-primary shrink-0" />
                      <p className="text-body-md text-on-surface truncate">{s.origin}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon name="place" className="text-[16px] text-secondary shrink-0" />
                      <p className="text-body-md text-on-surface truncate">{s.destination}</p>
                    </div>
                  </div>
                  <AssignDriverClient serviceId={s.id} currentDriverId={s.driverId} drivers={drivers} />
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </main>
    </PageTransition>
  );
}
