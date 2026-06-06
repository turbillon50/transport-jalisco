"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { reviewDriverDocument } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Alert } from "@/components/ui";
import { EmptyState } from "@/components/ui-bits";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { DriverDocsGroup } from "@/lib/queries";

const KIND_LABEL: Record<string, string> = {
  foto_chofer: "Foto del chofer",
  foto_unidad: "Foto de la unidad",
  licencia: "Licencia",
  tarjeta_circulacion: "Tarjeta de circulación",
  otro: "Otro",
};
const STATUS: Record<string, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-surface-container-high text-on-surface-variant" },
  aprobado: { label: "Verificado", cls: "bg-secondary-container text-on-secondary" },
  rechazado: { label: "Rechazado", cls: "bg-error/10 text-error" },
};

export function VerificationsManager({ initial }: { initial: DriverDocsGroup[] }) {
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();

  function review(docId: string, status: "aprobado" | "rechazado") {
    let note: string | undefined;
    if (status === "rechazado") {
      note = window.prompt("Motivo del rechazo (opcional):") ?? undefined;
    }
    start(async () => {
      const res = await reviewDriverDocument(docId, status, note);
      setToast({ ok: res.ok, message: res.message });
      if (res.ok) window.setTimeout(() => window.location.reload(), 600);
    });
  }

  if (initial.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
        <EmptyState icon="verified_user" title="Sin documentos por revisar" body="Cuando un chofer suba su foto, la de su unidad o sus documentos, aparecerán aquí para verificarlos." />
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {toast && <Alert type={toast.ok ? "success" : "error"} message={toast.message} onClose={() => setToast(null)} />}
      <StaggerContainer className="space-y-lg">
        {initial.map((g) => (
          <StaggerItem key={g.driverId}>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-lg py-4 bg-surface-container-low">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0"><Icon name="local_taxi" fill /></div>
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface truncate">{g.name}</p>
                    <p className="text-label-md text-on-surface-variant truncate">{g.email}{g.vehiclePlate ? ` · ${g.vehiclePlate}` : ""}</p>
                  </div>
                </div>
                {g.pending > 0 && <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-error/10 text-error whitespace-nowrap">{g.pending} pendiente{g.pending > 1 ? "s" : ""}</span>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 p-lg">
                {g.docs.map((d) => {
                  const st = STATUS[d.status];
                  return (
                    <div key={d.id} className="border border-outline-variant rounded-lg p-3 flex gap-3">
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                        {d.isPdf ? <Icon name="picture_as_pdf" className="text-3xl text-error" /> : <Image src={d.url} alt={KIND_LABEL[d.kind]} width={80} height={80} className="object-cover w-full h-full" unoptimized />}
                      </a>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-label-lg font-semibold text-on-surface truncate">{KIND_LABEL[d.kind]}</p>
                          <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full whitespace-nowrap", st.cls)}>{st.label}</span>
                        </div>
                        <p className="text-label-md text-on-surface-variant">{d.time}</p>
                        <div className="flex gap-2 mt-auto pt-2">
                          <button disabled={pending} onClick={() => review(d.id, "aprobado")} className="flex-1 h-9 rounded-lg bg-secondary-container text-on-secondary text-label-md font-semibold flex items-center justify-center gap-1 disabled:opacity-50 active:scale-95 transition">
                            <Icon name="check" className="text-[18px]" /> Aprobar
                          </button>
                          <button disabled={pending} onClick={() => review(d.id, "rechazado")} className="flex-1 h-9 rounded-lg bg-surface-container-high text-error text-label-md font-semibold flex items-center justify-center gap-1 disabled:opacity-50 active:scale-95 transition">
                            <Icon name="close" className="text-[18px]" /> Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
