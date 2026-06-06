import type { Metadata } from "next";
import { MapScreen } from "@/components/map-screen";
import { getOpsStats, getFleetPositions } from "@/lib/queries";
import type { MapMarker } from "@/components/map-view";

export const metadata: Metadata = { title: "Mapa operativo" };
export const dynamic = "force-dynamic";

export default async function OpsMap() {
  const [stats, fleet] = await Promise.all([getOpsStats(), getFleetPositions()]);

  const markers: MapMarker[] = fleet.map((u) => ({
    id: u.serviceId,
    lng: u.lng,
    lat: u.lat,
    type: "vehicle",
    label: u.plate ?? "▣",
  }));

  return (
    <MapScreen
      markers={markers}
      stats={[
        { value: fleet.length, label: "Unidades", cls: "text-secondary" },
        { value: stats.enCurso, label: "En ruta", cls: "text-[#00b4d8]" },
        { value: stats.pendientes, label: "Pendientes", cls: "text-on-surface" },
        { value: stats.choferes, label: "Choferes", cls: "text-primary" },
      ]}
    />
  );
}
