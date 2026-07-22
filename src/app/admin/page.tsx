import type { Metadata } from "next";
import { getOpsStats, getAnalytics, getAuditLog } from "@/lib/queries";
import SaludClient from "./SaludClient";

export const metadata: Metadata = { title: "Salud · Admin MT" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, analytics, audit] = await Promise.all([getOpsStats(), getAnalytics(), getAuditLog()]);

  const total = analytics.totals.servicios || 0;
  const done = analytics.totals.completados || 0;
  const pend = stats.pendientes || 0;
  const chof = stats.choferes || 0;

  // Score honesto: tasa de completados menos castigo por pendientes acumulados.
  const rate = total > 0 ? done / total : 1;
  const penalty = Math.min(30, pend * 3);
  const score = Math.max(0, Math.min(100, Math.round(rate * 100 - penalty)));

  const kpis = [
    { label: "Servicios totales", value: total, hint: "Histórico registrado" },
    { label: "Completados", value: done, hint: total ? `${Math.round(rate * 100)}% del total` : "Sin servicios aún" },
    { label: "Pendientes", value: pend, hint: pend ? "Requieren asignación" : "Nada en espera" },
    { label: "Choferes", value: chof, hint: "Alta manual por admin" },
  ];

  const alerts: { sev: "alta" | "media" | "baja"; title: string; body: string; href: string }[] = [];
  if (pend > 0) alerts.push({ sev: "alta", title: `${pend} traslado${pend > 1 ? "s" : ""} sin asignar`, body: "Asigna chofer para no afectar el servicio.", href: "/admin/traslados" });
  if (chof === 0) alerts.push({ sev: "alta", title: "Sin choferes dados de alta", body: "Agrega choferes para poder asignar viajes.", href: "/admin/drivers" });
  if (total === 0) alerts.push({ sev: "media", title: "Aún no hay servicios registrados", body: "Los KPIs se llenan al operar el primer traslado.", href: "/admin/empresas" });

  const weekly = (analytics.weekly || []).map((w) => ({
    label: String(w.day ?? "").slice(0, 3),
    value: Number(w.servicios ?? 0),
  }));

  return <SaludClient score={score} kpis={kpis} alerts={alerts} weekly={weekly} audit={audit} />;
}
