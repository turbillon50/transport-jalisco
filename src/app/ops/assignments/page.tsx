"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { drivers } from "@/lib/mock";
import { assignDriver } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Badge, Alert } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";

interface Pending {
  id: string;
  time: string;
  origin: string;
  destination: string;
  tag: { label: string; tone: "error" | "secondary" };
  pax: number;
  icon: string;
}

const INITIAL: Pending[] = [
  { id: "9101", time: "09:30 AM", origin: "Hotel Hilton", destination: "Centro Expo GDL", tag: { label: "Urgente", tone: "error" }, pax: 1, icon: "location_on" },
  { id: "9102", time: "12:00 PM", origin: "Domicilio Particular", destination: "Plaza Andares", tag: { label: "Programado", tone: "secondary" }, pax: 2, icon: "home" },
  { id: "9103", time: "03:00 PM", origin: "Empresa ABC", destination: "Aeropuerto GDL", tag: { label: "Empresarial", tone: "secondary" }, pax: 1, icon: "business" },
];

export default function AssignmentsPage() {
  const available = drivers.filter((d) => d.status !== "En servicio");
  const [selected, setSelected] = useState<string | null>(null);
  const [pendings, setPendings] = useState(INITIAL);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function assign(serviceId: string) {
    if (!selected) {
      setToast("Selecciona primero un chofer disponible.");
      return;
    }
    const driver = drivers.find((d) => d.id === selected)!;
    setPendings((p) => p.filter((s) => s.id !== serviceId));
    setSelected(null);
    setToast(`${driver.name} asignado al servicio #${serviceId}.`);
    startTransition(() => { void assignDriver(serviceId, driver.name); });
  }

  return (
    <PageTransition className="flex flex-col h-[calc(100dvh-4rem)] md:h-[100dvh]">
      <PageHeader title="Asignaciones" right={<span className="text-label-lg text-on-surface-variant">24 Mayo, 2024</span>} />
      {toast && (
        <div className="px-margin-mobile md:px-margin-desktop pt-3">
          <Alert type="success" message={toast} />
        </div>
      )}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row gap-gutter p-margin-mobile md:p-margin-desktop">
        {/* Choferes */}
        <section className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h2 className="text-headline-sm font-semibold text-primary">Choferes disponibles</h2>
            <Badge variant="info">{available.length} Activos</Badge>
          </div>
          <StaggerContainer className="flex-1 overflow-y-auto p-md space-y-sm">
            {drivers.map((d) => {
              const locked = d.status === "En servicio";
              const active = selected === d.id;
              return (
                <StaggerItem key={d.id}>
                  <button
                    disabled={locked}
                    onClick={() => setSelected(active ? null : d.id)}
                    className={cn(
                      "w-full flex items-center p-md bg-surface-container-lowest border rounded-lg transition-all group text-left",
                      locked ? "opacity-60 cursor-not-allowed border-outline-variant" : "hover:border-primary hover:shadow-md",
                      active ? "border-primary ring-2 ring-primary/30 bg-primary-fixed/30" : "border-outline-variant",
                    )}
                  >
                    <Image src={d.avatar} alt={d.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover border-2 border-primary-fixed" />
                    <div className="ml-4 flex-1">
                      <p className="text-label-lg font-semibold text-on-surface">{d.name}</p>
                      <div className="flex items-center gap-1">
                        <span className={cn("w-2 h-2 rounded-full", locked ? "bg-tertiary-fixed-dim" : "bg-green-500")} />
                        <span className="text-label-md text-on-surface-variant">{locked ? "En servicio" : "Disponible"}</span>
                      </div>
                    </div>
                    <Icon name={locked ? "lock" : active ? "check_circle" : "touch_app"} className={cn(active ? "text-primary" : "text-outline-variant group-hover:text-primary")} />
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

        {/* Servicios */}
        <section className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h2 className="text-headline-sm font-semibold text-primary">Servicios sin asignar</h2>
            <div className="flex items-center gap-2 text-error"><Icon name="warning" className="text-[20px]" /><span className="text-label-md">{pendings.length} Pendientes</span></div>
          </div>
          <div className="flex-1 overflow-y-auto p-md space-y-md">
            {pendings.map((s) => (
              <button
                key={s.id}
                onClick={() => assign(s.id)}
                className={cn(
                  "w-full text-left relative group p-lg border-2 border-dashed rounded-xl bg-surface transition-all",
                  selected ? "border-primary bg-primary-fixed/20 animate-pulse-glow" : "border-outline-variant hover:border-primary",
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2"><Icon name="schedule" className="text-primary" /><span className="text-headline-sm font-semibold text-primary">{s.time}</span></div>
                  <Badge variant={s.tag.tone === "error" ? "danger" : "info"}>{s.tag.label}</Badge>
                </div>
                <div className="space-y-sm">
                  <div className="flex items-start gap-3"><Icon name={s.icon} className="text-outline text-[18px] mt-1" /><div><p className="text-label-md text-on-surface-variant uppercase">Origen</p><p className="text-body-lg text-on-surface">{s.origin}</p></div></div>
                  <div className="h-6 ml-2 border-l-2 border-dotted border-outline-variant" />
                  <div className="flex items-start gap-3"><Icon name="navigation" className="text-primary text-[18px] mt-1" /><div><p className="text-label-md text-on-surface-variant uppercase">Destino</p><p className="text-body-lg text-on-surface">{s.destination}</p></div></div>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center">
                  <div className="flex items-center gap-1 text-on-surface-variant"><Icon name="group" className="text-[18px]" /><span className="text-label-lg">{s.pax} pasajero{s.pax > 1 ? "s" : ""}</span></div>
                  <span className={cn("text-primary text-label-lg flex items-center gap-1 transition-opacity", selected ? "opacity-100" : "opacity-0 group-hover:opacity-60")}>
                    Asignar aquí <Icon name="add_circle" className="text-[18px]" />
                  </span>
                </div>
              </button>
            ))}
            {pendings.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant"><Icon name="check_circle" fill className="text-5xl text-green-500" /><p className="mt-3 font-semibold">Todos los servicios están asignados</p></div>
            )}
          </div>
          <div className="p-lg bg-primary-fixed/30 border-t border-outline-variant flex items-center justify-center gap-2">
            <Icon name="touch_app" className="text-primary" />
            <span className="text-label-lg font-semibold text-primary">{selected ? "Toca un servicio para asignar" : "Selecciona un chofer disponible"}</span>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
