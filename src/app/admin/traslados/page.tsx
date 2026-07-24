import type { Metadata } from "next";
import { getServicesHistory, getStatusCounts } from "@/lib/queries-traslados";
import { getDriversAdmin } from "@/lib/queries";
import { TrasladosClient } from "./TrasladosClient";

export const metadata: Metadata = { title: "Traslados" };
export const dynamic = "force-dynamic";

export default async function TrasladosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    estado: sp.estado || undefined,
    q: sp.q || undefined,
    desde: sp.desde || undefined,
    hasta: sp.hasta || undefined,
  };
  const [rows, counts, driversRaw] = await Promise.all([
    getServicesHistory(filters),
    getStatusCounts(),
    getDriversAdmin(),
  ]);
  const drivers = (driversRaw as any[]).map((d) => ({ id: d.id, name: d.name }));
  return <TrasladosClient rows={rows as any} counts={counts} drivers={drivers} filters={filters} />;
}
