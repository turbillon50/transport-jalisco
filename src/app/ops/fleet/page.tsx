import type { Metadata } from "next";
import { getVehicles } from "@/lib/queries";
import { Icon } from "@/components/icon";
import { Button, Input, Badge, type BadgeVariant } from "@/components/ui";
import { EmptyState } from "@/components/ui-bits";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

export const metadata: Metadata = { title: "Gestión de flota" };
export const dynamic = "force-dynamic";

const tone: Record<string, BadgeVariant> = { operativo: "success", mantenimiento: "warning", inactivo: "danger" };

export default async function FleetPage() {
  const vehicles = await getVehicles();

  return (
    <PageTransition className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <FadeInOnScroll>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-headline-lg font-semibold text-primary mb-1">Gestión de flota</h2>
            <p className="text-on-surface-variant text-body-md">{vehicles.length} unidades registradas.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="min-w-[240px]"><Input icon="search" placeholder="Buscar vehículo o placas…" /></div>
            <Button icon="add">Añadir vehículo</Button>
          </div>
        </div>
      </FadeInOnScroll>

      {vehicles.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
          <EmptyState icon="local_shipping" title="Sin unidades aún" body="Registra tu primera unidad para gestionar la flota." action={<Button icon="add">Añadir vehículo</Button>} />
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {vehicles.map((v) => (
            <StaggerItem key={v.id}>
              <HoverCard className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center"><Icon name="airport_shuttle" /></div>
                    <div><h3 className="text-headline-sm font-semibold text-primary">{v.model}</h3><span className="text-label-md text-outline">Placas: {v.plate}</span></div>
                  </div>
                  <Badge variant={tone[v.status] ?? "default"}>{v.status}</Badge>
                </div>
                <div className="space-y-2 text-on-surface-variant mb-4">
                  <div className="flex items-center gap-3"><Icon name="group" className="text-[18px]" /><span className="text-body-md">Capacidad: {v.capacity} pasajeros</span></div>
                  <div className="flex items-center gap-3"><Icon name="distance" className="text-[18px]" /><span className="text-body-md">Odómetro: {(v.odometer ?? 0).toLocaleString("es-MX")} km</span></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-grow">Detalles</Button>
                  <Button size="sm" className="flex-grow" disabled={v.status === "mantenimiento"}>Asignar</Button>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
