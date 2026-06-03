import Image from "next/image";
import type { Metadata } from "next";
import { vehicles, fleetStats } from "@/lib/mock";
import { Icon } from "@/components/icon";
import { Button, Input } from "@/components/ui";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard, NumberCounter } from "@/components/motion";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Gestión de flota" };

const statusBadge: Record<string, string> = {
  operativo: "bg-green-100 text-green-800 border-green-200",
  mantenimiento: "bg-orange-100 text-orange-800 border-orange-200",
  inactivo: "bg-error-container text-on-error-container border-error/30",
};
const statusDot: Record<string, string> = { operativo: "bg-green-500", mantenimiento: "bg-orange-500", inactivo: "bg-error" };
const statusLabel: Record<string, string> = { operativo: "Operativo", mantenimiento: "Mantenimiento", inactivo: "Inactivo" };

export default function FleetPage() {
  const STATS = [
    { label: "Total Unidades", value: fleetStats.total, cls: "text-primary" },
    { label: "En Servicio", value: fleetStats.enServicio, cls: "text-secondary" },
    { label: "Mantenimiento", value: fleetStats.mantenimiento, cls: "text-tertiary-container", border: "border-l-4 border-l-tertiary-container" },
    { label: "Inactivos", value: fleetStats.inactivos, cls: "text-error", border: "border-l-4 border-l-error" },
  ];

  return (
    <PageTransition className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <FadeInOnScroll>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-headline-lg font-semibold text-primary mb-1">Gestión de Flota</h2>
            <p className="text-on-surface-variant text-body-md">Monitoreo y administración de unidades operativas.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="min-w-[260px]"><Input icon="search" placeholder="Buscar vehículo o placas..." /></div>
            <Button icon="add">Añadir Vehículo</Button>
          </div>
        </div>
      </FadeInOnScroll>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-8">
        {STATS.map((s) => (
          <StaggerItem key={s.label}>
            <div className={cn("bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-center items-center text-center", s.border)}>
              <span className="text-label-md text-outline uppercase tracking-wider mb-2">{s.label}</span>
              <span className={cn("text-display-lg font-bold", s.cls)}><NumberCounter value={s.value} /></span>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {vehicles.map((v) => (
          <StaggerItem key={v.id}>
            <HoverCard className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden h-full">
              <div className="relative h-48 w-full overflow-hidden">
                <Image src={v.image} alt={v.model} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                <div className={cn("absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border", statusBadge[v.status])}>
                  <span className={cn("w-2 h-2 rounded-full", statusDot[v.status])} /> {statusLabel[v.status]}
                </div>
              </div>
              <div className="p-lg">
                <div className="flex justify-between items-start mb-4">
                  <div><h3 className="text-headline-sm font-semibold text-primary">{v.model}</h3><span className="text-label-md text-outline">Placas: {v.plate}</span></div>
                  <Icon name="more_vert" className="text-outline cursor-pointer hover:text-primary" />
                </div>
                <div className="space-y-3 mb-6 text-on-surface-variant">
                  <div className="flex items-center gap-3"><Icon name="group" className="text-[18px]" /><span className="text-body-md">Capacidad: {v.capacity} pasajeros</span></div>
                  <div className="flex items-center gap-3"><Icon name="history" className="text-[18px]" /><span className="text-body-md">{v.detail}</span></div>
                  <div className="flex items-center gap-3"><Icon name="distance" className="text-[18px]" /><span className="text-body-md">{v.odometer}</span></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-grow">Detalles</Button>
                  <Button size="sm" className="flex-grow" disabled={v.status === "mantenimiento"}>Asignar</Button>
                </div>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </PageTransition>
  );
}
