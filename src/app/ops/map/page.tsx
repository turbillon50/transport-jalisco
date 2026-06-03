import type { Metadata } from "next";
import { MapScreen } from "@/components/map-screen";
import { fleetMarkers } from "@/lib/mock";

export const metadata: Metadata = { title: "Mapa operativo" };

export default function OpsMap() {
  return (
    <MapScreen
      markers={fleetMarkers}
      stats={[
        { value: 18, label: "En ruta", cls: "text-secondary" },
        { value: 7, label: "Retraso", cls: "text-tertiary-container" },
        { value: 5, label: "Pendientes", cls: "text-on-surface" },
        { value: 2, label: "Alertas", cls: "text-error" },
      ]}
    />
  );
}
