"use client";

import { useState, useTransition } from "react";
import { assignDriver } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Badge, Alert } from "@/components/ui";
import { EmptyState } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

interface Svc { id: string; time: string; day: string; month: string; origin: string; destination: string; passengers: number }
interface Drv { id: string; name: string }

export function AssignmentsBoard({ services, drivers }: { services: Svc[]; drivers: Drv[] }) {
  const [pendings, setPendings] = useState(services);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [, start] = useTransition();

  function assign(serviceId: string) {
    if (!selected) { setToast("Selecciona primero un chofer."); return; }
    const driver = drivers.find((d) => d.id === selected);
    if (!driver) return;
    setPendings((p) => p.filter((s) => s.id !== serviceId));
    setSelected(null);
    setToast(`${driver.name} asignado al servicio.`);
    start(() => { void assignDriver(serviceId, driver.name); });
  }

  return (
    <div className="space-y-4">
      {toast && <Alert type="success" message={toast} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Choferes */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h2 className="text-headline-sm font-semibold text-primary">Choferes</h2>
            <Badge variant="info">{drivers.length}</Badge>
          </div>
          {drivers.length === 0 ? (
            <EmptyState icon="badge" title="Sin choferes" body="Asigna el rol 'driver' a un usuario para poder asignar servicios." />
          ) : (
            <div className="p-md space-y-sm max-h-[60vh] overflow-y-auto">
              {drivers.map((d) => {
                const active = selected === d.id;
                return (
                  <button key={d.id} onClick={() => setSelected(active ? null : d.id)}
                    className={cn("w-full flex items-center gap-3 p-md border rounded-lg text-left transition-all",
                      active ? "border-primary ring-2 ring-primary/30 bg-primary-fixed/30" : "border-outline-variant hover:border-primary")}>
                    <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center"><Icon name="person" fill /></div>
                    <span className="flex-1 font-semibold text-on-surface">{d.name}</span>
                    <Icon name={active ? "check_circle" : "touch_app"} className={active ? "text-primary" : "text-outline-variant"} />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Servicios */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h2 className="text-headline-sm font-semibold text-primary">Servicios sin asignar</h2>
            <div className="flex items-center gap-2 text-error"><Icon name="warning" className="text-[20px]" /><span className="text-label-md">{pendings.length}</span></div>
          </div>
          {pendings.length === 0 ? (
            <EmptyState icon="task_alt" title="Todo asignado" body="No hay traslados pendientes." />
          ) : (
            <div className="p-md space-y-md max-h-[60vh] overflow-y-auto">
              {pendings.map((s) => (
                <button key={s.id} onClick={() => assign(s.id)}
                  className={cn("w-full text-left p-lg border-2 border-dashed rounded-xl bg-surface transition-all",
                    selected ? "border-primary bg-primary-fixed/20" : "border-outline-variant hover:border-primary")}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2"><Icon name="schedule" className="text-primary" /><span className="text-headline-sm font-semibold text-primary">{s.time}</span></div>
                    <span className="text-label-md text-on-surface-variant">{s.day} {s.month}</span>
                  </div>
                  <p className="text-body-lg font-semibold text-on-surface">{s.origin} → {s.destination}</p>
                  <div className="mt-3 pt-3 border-t border-outline-variant flex justify-between items-center">
                    <span className="flex items-center gap-1 text-on-surface-variant"><Icon name="group" className="text-[18px]" /><span className="text-label-lg">{s.passengers} pax</span></span>
                    <span className={cn("text-primary text-label-lg flex items-center gap-1 transition-opacity", selected ? "opacity-100" : "opacity-0")}>Asignar aquí <Icon name="add_circle" className="text-[18px]" /></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
