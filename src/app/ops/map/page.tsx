import type { Metadata } from "next";
import { MapScreen } from "@/components/map-screen";
import { getOpsStats } from "@/lib/queries";

export const metadata: Metadata = { title: "Mapa operativo" };
export const dynamic = "force-dynamic";

export default async function OpsMap() {
  const stats = await getOpsStats();
  return (
    <MapScreen
      markers={[]}
      stats={[
        { value: stats.enCurso, label: "En ruta", cls: "text-secondary" },
        { value: stats.pendientes, label: "Pendientes", cls: "text-tertiary-container" },
        { value: stats.hoy, label: "Activos", cls: "text-on-surface" },
        { value: stats.choferes, label: "Choferes", cls: "text-primary" },
      ]}
    />
  );
}
