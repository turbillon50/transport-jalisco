"use client";

import { useState, useTransition } from "react";
import { createDriver, updateDriver, setDriverBlocked } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Button, Input, Badge, Alert, Modal } from "@/components/ui";
import { EmptyState, Stars } from "@/components/ui-bits";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import type { AdminDriverRow } from "@/lib/queries";

export function DriversManager({ initialDrivers }: { initialDrivers: AdminDriverRow[] }) {
  const [rows, setRows] = useState(initialDrivers);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminDriverRow | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = rows.filter((r) =>
    `${r.name} ${r.email} ${r.phone ?? ""} ${r.vehiclePlate ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  function refresh(message: string, ok: boolean) {
    setToast({ ok, message });
    // Optimistic UI se reemplaza al revalidar la ruta del servidor.
    window.setTimeout(() => window.location.reload(), 600);
  }

  function onCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createDriver(formData);
      if (res.ok) setCreating(false);
      refresh(res.message, res.ok);
    });
  }

  function onUpdate(id: string, formData: FormData) {
    startTransition(async () => {
      const res = await updateDriver(id, formData);
      if (res.ok) setEditing(null);
      refresh(res.message, res.ok);
    });
  }

  function onToggleBlock(d: AdminDriverRow) {
    setRows((rs) => rs.map((r) => (r.id === d.id ? { ...r, blocked: !r.blocked } : r)));
    startTransition(async () => {
      const res = await setDriverBlocked(d.id, !d.blocked);
      refresh(res.message, res.ok);
    });
  }

  return (
    <div className="space-y-lg">
      {toast && <Alert type={toast.ok ? "success" : "error"} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="max-w-sm w-full">
          <Input icon="search" placeholder="Buscar chofer…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button icon="add" onClick={() => setCreating(true)}>
          Alta de chofer
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
          <EmptyState
            icon="local_taxi"
            title="Sin choferes todavía"
            body="Da de alta a tu primer chofer para empezar a asignar servicios."
            action={<Button icon="add" onClick={() => setCreating(true)}>Alta de chofer</Button>}
          />
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-[2fr_1.3fr_2fr_1.5fr_1fr_1.4fr] gap-4 px-lg py-3 bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider">
            <span>Chofer</span><span>Teléfono</span><span>Email</span><span>Vehículo</span><span>Estado</span><span className="text-right">Acciones</span>
          </div>
          <StaggerContainer>
            {filtered.map((d) => (
              <StaggerItem key={d.id}>
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.3fr_2fr_1.5fr_1fr_1.4fr] gap-2 lg:gap-4 items-center px-lg py-4 border-t border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                      <Icon name="local_taxi" fill className="text-[20px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">{d.name}</p>
                      {d.rating != null && <Stars value={d.rating} size={13} />}
                    </div>
                  </div>
                  <span className="text-body-md text-on-surface-variant">{d.phone ?? "—"}</span>
                  <span className="text-body-md text-on-surface-variant truncate">{d.email}</span>
                  <span className="text-body-md text-on-surface-variant truncate">
                    {d.vehiclePlate ? `${d.vehiclePlate}${d.vehicleModel ? ` · ${d.vehicleModel}` : ""}` : "—"}
                  </span>
                  <span>
                    {d.blocked ? <Badge variant="danger">Bloqueado</Badge> : <Badge variant="success">Activo</Badge>}
                  </span>
                  <div className="flex items-center gap-2 lg:justify-end">
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => setEditing(d)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={d.blocked ? "outline" : "danger"}
                      icon={d.blocked ? "lock_open" : "block"}
                      disabled={pending}
                      onClick={() => onToggleBlock(d)}
                    >
                      {d.blocked ? "Activar" : "Bloquear"}
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}

      {/* Alta */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Alta de chofer" size="lg">
        <form action={onCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="name" label="Nombre *" placeholder="Juan Pérez" required />
            <Input name="phone" label="Teléfono *" placeholder="33 1234 5678" required />
          </div>
          <Input name="email" label="Email (opcional)" type="email" placeholder="chofer@correo.com" />
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider pt-2">Vehículo (opcional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input name="plate" label="Placa" placeholder="JAL-123-A" />
            <Input name="model" label="Modelo" placeholder="Toyota Hiace" />
            <Input name="capacity" label="Capacidad" type="number" min={1} placeholder="4" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button type="submit" icon="check" loading={pending}>Dar de alta</Button>
          </div>
        </form>
      </Modal>

      {/* Editar */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar chofer" size="md">
        {editing && (
          <form action={(fd) => onUpdate(editing.id, fd)} className="space-y-4">
            <Input name="name" label="Nombre *" defaultValue={editing.name} required />
            <Input name="phone" label="Teléfono *" defaultValue={editing.phone ?? ""} required />
            <Input name="email" label="Email" type="email" defaultValue={editing.email} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button type="submit" icon="check" loading={pending}>Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
