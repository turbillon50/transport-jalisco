import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, FadeInOnScroll } from "@/components/motion";
import { Icon } from "@/components/icon";
import { db, hasDb } from "@/db";
import { services } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export const metadata: Metadata = { title: "Reportes" };
export const dynamic = "force-dynamic";

async function getReporteData() {
  if (!hasDb) return { byStatus: [], recent: [] };
  try {
    const byStatus = await db
      .select({ status: services.status, count: sql<number>`count(*)::int` })
      .from(services).groupBy(services.status);
    const recent = await db.select().from(services).orderBy(desc(services.createdAt)).limit(20);
    return { byStatus, recent };
  } catch { return { byStatus: [], recent: [] }; }
}

export default async function ReportesPage() {
  const { byStatus, recent } = await getReporteData();
  const total = byStatus.reduce((s, r) => s + (r.count ?? 0), 0);
  return (
    <PageTransition>
      <PageHeader title="Reportes" />
      <div className="px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto mt-2">
        <a href="/api/admin/export" className="inline-block text-sm border border-outline-variant rounded-xl px-4 py-2">Descargar CSV de traslados</a>
      </div>
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto space-y-xl">
        <FadeInOnScroll>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            {byStatus.map((b) => (
              <div key={b.status} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                <p className="text-display-md font-bold text-primary">{b.count}</p>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">{b.status.replace("_"," ")}</p>
              </div>
            ))}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <p className="text-display-md font-bold text-secondary">{total}</p>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Total</p>
            </div>
          </div>
        </FadeInOnScroll>
        <FadeInOnScroll delay={0.1}>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant">
              <h3 className="text-title-md font-semibold text-on-surface">Traslados recientes</h3>
            </div>
            <div className="divide-y divide-outline-variant">
              {recent.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-4">
                  <Icon name="directions_car" className="text-primary text-[20px] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md font-medium text-on-surface truncate">{s.origin} to {s.destination}</p>
                    <p className="text-label-sm text-on-surface-variant">{new Date(s.createdAt).toLocaleDateString("es-MX")} - {s.status}</p>
                  </div>
                </div>
              ))}
              {recent.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant">
                  <p className="text-label-md">Sin datos registrados</p>
                </div>
              )}
            </div>
          </div>
        </FadeInOnScroll>
      </main>
    </PageTransition>
  );
}
