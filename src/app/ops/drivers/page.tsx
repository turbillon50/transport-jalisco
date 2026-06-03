"use client";

import Image from "next/image";
import { useState } from "react";
import { drivers, driverStats, type MockDriver } from "@/lib/mock";
import { Icon } from "@/components/icon";
import { Button, Input, Drawer } from "@/components/ui";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard, NumberCounter } from "@/components/motion";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  "En ruta": "bg-secondary-fixed text-on-secondary-fixed-variant",
  Disponible: "bg-surface-container text-on-surface-variant",
  Descanso: "bg-surface-container-highest text-on-surface-variant",
  "En servicio": "bg-tertiary-fixed text-on-tertiary-fixed-variant",
};

export default function DriversPage() {
  const [selected, setSelected] = useState<MockDriver | null>(null);
  const STATS = [
    { label: "Total", value: driverStats.total, cls: "text-primary" },
    { label: "En Ruta", value: driverStats.enRuta, cls: "text-secondary" },
    { label: "Disponibles", value: driverStats.disponibles, cls: "text-tertiary-container" },
    { label: "Docs Vencidos", value: driverStats.docsVencidos, cls: "text-error" },
  ];

  return (
    <PageTransition className="max-w-[1440px] mx-auto p-margin-mobile md:p-margin-desktop pb-24">
      <FadeInOnScroll>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-xl">
          <div>
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-semibold text-primary mb-2">Gestión de Choferes</h2>
            <p className="text-body-md text-on-surface-variant">Monitorea y administra el personal operativo de tu flota.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-md">
            <div className="md:w-72"><Input icon="search" placeholder="Buscar por nombre..." /></div>
            <Button icon="person_add">Registrar Chofer</Button>
          </div>
        </div>
      </FadeInOnScroll>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {STATS.map((s) => (
          <StaggerItem key={s.label}>
            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl">
              <p className="text-label-md text-outline uppercase tracking-wider mb-2">{s.label}</p>
              <p className={cn("text-headline-md font-semibold", s.cls)}><NumberCounter value={s.value} /></p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {drivers.map((d) => (
          <StaggerItem key={d.id}>
            <HoverCard className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col gap-lg cursor-pointer h-full" onClick={() => setSelected(d)}>
              <div className="flex justify-between items-start">
                <div className="flex gap-md items-center">
                  <Image src={d.avatar} alt={d.name} width={56} height={56} className="w-14 h-14 rounded-full object-cover border-2 border-surface-variant" />
                  <div>
                    <h3 className="text-headline-sm font-semibold text-on-surface">{d.name}</h3>
                    <div className="flex items-center gap-1"><Icon name="star" fill className="text-tertiary-fixed-dim text-sm" /><span className="text-label-lg text-on-surface-variant">{d.rating}</span></div>
                  </div>
                </div>
                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1", statusStyle[d.status])}>
                  <span className="w-1.5 h-1.5 bg-current rounded-full" /> {d.status}
                </span>
              </div>
              <div className="space-y-sm">
                <div className="flex justify-between items-center py-2 border-b border-surface-variant"><span className="text-body-md text-on-surface-variant">Documentación</span><span className="text-label-lg font-semibold text-[#006e1c]">{d.docs}</span></div>
                <div className="flex justify-between items-center py-2"><span className="text-body-md text-on-surface-variant">Vehículo Asignado</span><span className="text-label-lg font-semibold text-on-surface">{d.vehicle}</span></div>
              </div>
              <Button variant="outline" className="w-full">Ver Detalles</Button>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Detalle del Chofer">
        {selected && (
          <div className="flex flex-col h-full">
            <div className="flex flex-col items-center mb-xl">
              <Image src={selected.avatar} alt={selected.name} width={96} height={96} className="w-24 h-24 rounded-full border-4 border-primary-fixed mb-md object-cover" />
              <h4 className="text-headline-sm font-semibold">{selected.name}</h4>
              <p className="text-secondary font-bold">{selected.status} · {selected.vehicle}</p>
            </div>
            <div className="space-y-lg">
              <div className="bg-surface-container-low p-md rounded-lg">
                <p className="text-label-md text-outline uppercase mb-2">Información de Contacto</p>
                <p className="text-body-md flex items-center gap-2 mb-1"><Icon name="phone" className="text-sm" /> +52 33 1234 5678</p>
                <p className="text-body-md flex items-center gap-2"><Icon name="mail" className="text-sm" /> {selected.name.split(" ")[0].toLowerCase()}@mtempresarial.com</p>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="bg-surface-container-low p-md rounded-lg"><p className="text-label-md text-outline uppercase mb-1">Licencia</p><p className="text-label-lg font-semibold">Vigente</p></div>
                <div className="bg-surface-container-low p-md rounded-lg"><p className="text-label-md text-outline uppercase mb-1">Calificación</p><p className="text-label-lg font-semibold">{selected.rating} ★</p></div>
              </div>
            </div>
            <div className="flex gap-md mt-auto pt-lg">
              <Button fullWidth>Editar Perfil</Button>
              <Button variant="outline" fullWidth className="border-error text-error">Suspender</Button>
            </div>
          </div>
        )}
      </Drawer>
    </PageTransition>
  );
}
