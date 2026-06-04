"use client";

import { useState, useTransition } from "react";
import { advanceService } from "@/app/actions";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type Status = "driver_arrived" | "started" | "completed";

export function DriverControls({ serviceId, status }: { serviceId: string; status: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  function emit(s: Status, label: string) {
    start(async () => {
      await advanceService(serviceId, s);
      setDone(label);
    });
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-label-lg font-semibold">
        <Icon name="check_circle" fill /> {done}
      </div>
    );
  }

  const steps: { s: Status; label: string; icon: string; cls: string }[] = [
    { s: "driver_arrived", label: "Llegué", icon: "location_on", cls: "bg-surface-container-high text-primary" },
    { s: "started", label: "Iniciar", icon: "play_arrow", cls: "bg-primary text-on-primary" },
    { s: "completed", label: "Finalizar", icon: "flag", cls: "bg-secondary-container text-on-secondary" },
  ];

  return (
    <div className="flex gap-2">
      {steps.map((b) => (
        <button
          key={b.s}
          disabled={pending}
          onClick={() => emit(b.s, b.label === "Finalizar" ? "Servicio finalizado" : `Marcado: ${b.label}`)}
          className={cn("flex-1 h-12 rounded-lg flex items-center justify-center gap-1.5 text-label-lg font-semibold transition-all active:scale-95 disabled:opacity-50", b.cls)}
        >
          <Icon name={b.icon} fill className="text-[20px]" /> {b.label}
        </button>
      ))}
    </div>
  );
}
