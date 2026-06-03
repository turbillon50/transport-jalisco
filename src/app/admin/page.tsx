import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { getOpsStats, getAnalytics, getAuditLog } from "@/lib/queries";
import { ServicesLineChart } from "@/components/charts";
import { Card } from "@/components/ui";
import { EmptyState } from "@/components/ui-bits";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard, NumberCounter } from "@/components/motion";

export const metadata: Metadata = { title: "Superadmin" };
export const dynamic = "force-dynamic";

const SHORTCUTS = [
  { href: "/admin/analytics", icon: "monitoring", title: "Analytics", body: "KPIs, ingresos y demanda" },
  { href: "/admin/users", icon: "group", title: "Usuarios", body: "Roles y permisos" },
  { href: "/admin/notifications", icon: "campaign", title: "Push", body: "Campañas por segmento" },
  { href: "/admin/settings", icon: "settings", title: "Ajustes", body: "Feature flags y config" },
];

export default async function AdminDashboard() {
  const [stats, analytics, audit] = await Promise.all([getOpsStats(), getAnalytics(), getAuditLog()]);
  const kpis = [
    { icon: "directions_car", label: "Servicios totales", value: analytics.totals.servicios, cls: "text-secondary" },
    { icon: "task_alt", label: "Completados", value: analytics.totals.completados, cls: "text-green-600" },
    { icon: "schedule", label: "Pendientes", value: stats.pendientes, cls: "text-tertiary-container" },
    { icon: "badge", label: "Choferes", value: stats.choferes, cls: "text-primary" },
  ];

  return (
    <PageTransition>
      <PageHeader title="Superadmin" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto space-y-xl">
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {kpis.map((k) => (
            <StaggerItem key={k.label}>
              <HoverCard lift={-3} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl">
                <Icon name={k.icon} className={`text-[28px] mb-2 ${k.cls}`} />
                <p className="text-display-lg font-bold text-primary leading-none"><NumberCounter value={k.value} /></p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mt-1">{k.label}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <FadeInOnScroll className="lg:col-span-2">
            <Card className="p-lg h-full">
              <h3 className="text-headline-sm font-semibold text-on-surface mb-4">Servicios · últimos 7 días</h3>
              <ServicesLineChart data={analytics.weekly} />
            </Card>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <Card className="p-lg h-full">
              <h3 className="text-headline-sm font-semibold text-on-surface mb-4">Bitácora de auditoría</h3>
              {audit.length === 0 ? (
                <EmptyState icon="history" title="Sin actividad" body="Las acciones administrativas aparecerán aquí." />
              ) : (
                <ul className="space-y-4">
                  {audit.map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0" />
                      <div>
                        <p className="text-label-lg font-semibold text-on-surface">{a.action}</p>
                        <p className="text-label-md text-on-surface-variant">{a.target} · {a.actor} · {a.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </FadeInOnScroll>
        </div>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {SHORTCUTS.map((s) => (
            <StaggerItem key={s.href}>
              <Link href={s.href}>
                <HoverCard className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl h-full cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-3"><Icon name={s.icon} fill /></div>
                  <h4 className="text-label-lg font-semibold text-on-surface">{s.title}</h4>
                  <p className="text-body-md text-on-surface-variant">{s.body}</p>
                </HoverCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </main>
    </PageTransition>
  );
}
