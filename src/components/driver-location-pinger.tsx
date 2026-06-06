"use client";

import { useEffect, useRef, useState } from "react";
import { pushDriverLocation } from "@/app/actions";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/**
 * Comparte la ubicación del chofer (geolocalización del navegador) cada ~20s
 * mientras hay un servicio activo, para que el pasajero lo vea en el mapa y
 * operaciones siga la flota. Silencioso y tolerante a permisos denegados.
 */
export function DriverLocationPinger({ serviceId }: { serviceId: string }) {
  const [state, setState] = useState<"idle" | "on" | "denied">("idle");
  const last = useRef(0);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    let watchId: number;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setState("on");
          const now = Date.now();
          if (now - last.current < 20000) return; // throttle 20s
          last.current = now;
          void pushDriverLocation(serviceId, pos.coords.latitude, pos.coords.longitude);
        },
        () => setState("denied"),
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
      );
    } catch {
      setState("denied");
    }
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [serviceId]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-label-md font-semibold px-3 py-1.5 rounded-full w-fit",
        state === "on" ? "bg-secondary-container text-on-secondary" : state === "denied" ? "bg-surface-container-high text-error" : "bg-surface-container-high text-on-surface-variant",
      )}
    >
      <Icon name={state === "denied" ? "location_disabled" : "my_location"} className="text-[16px]" fill={state === "on"} />
      {state === "on" ? "Compartiendo ubicación en vivo" : state === "denied" ? "Activa la ubicación para compartir tu posición" : "Iniciando ubicación…"}
    </div>
  );
}
