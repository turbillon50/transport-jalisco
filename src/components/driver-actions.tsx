"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { advanceService } from "@/app/actions";
import { Button } from "@/components/ui";

type SvcStatus = "pendiente" | "asignado" | "confirmado" | "en_curso" | "completado" | "cancelado";

export function DriverActions({ serviceId, status }: { serviceId: string; status: SvcStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (status === "completado" || status === "cancelado") return null;

  function run(next: "started" | "completed", confirmText?: string) {
    if (confirmText && typeof window !== "undefined" && !window.confirm(confirmText)) return;
    startTransition(async () => {
      const res = await advanceService(serviceId, next);
      setMsg(res.message);
      router.refresh();
    });
  }

  const canStart = status === "asignado" || status === "confirmado";
  const canComplete = status === "en_curso";

  return (
    <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl space-y-3">
      <p className="text-label-lg font-semibold text-on-surface-variant uppercase">Acciones del chofer</p>
      {canStart && (
        <Button fullWidth icon="navigation" iconFill disabled={pending} onClick={() => run("started")}>
          {pending ? "Procesando…" : "Iniciar servicio"}
        </Button>
      )}
      {canComplete && (
        <Button fullWidth variant="primary" icon="check_circle" iconFill disabled={pending} onClick={() => run("completed", "¿Confirmas que el traslado terminó?")}>
          {pending ? "Procesando…" : "Completar servicio"}
        </Button>
      )}
      {!canStart && !canComplete && (
        <p className="text-body-md text-on-surface-variant">Este servicio aún no está listo para iniciar.</p>
      )}
      {msg && <p className="text-label-md text-primary">{msg}</p>}
    </div>
  );
}
