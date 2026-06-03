import type { Metadata } from "next";
import { getAnalytics, getOpsStats } from "@/lib/queries";
import { ServicesLineChart, RevenueBarChart, ServiceTypeDonut } from "@/components/charts";
import { Card } from "@/components/ui";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/ui-bits";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, NumberCounter } from "@/components/motion";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [a, stats] = await Promise.all([getAnalytics(), getOpsStats()]);
  const kpis = [
    { icon: "trending_up", label: "Ingresos totales", node: <NumberCounter value={a.totals.ingresos} prefix="$" /> },
    { icon: "directions_car", label: "Servicios", node: <NumberCounter value={a.totals.servicios} /> },
    { icon: "task_alt", label: "Completados", node: <NumberCounter value={a.totals.completados} /> },
    { icon: "badge", label: "Choferes", node: <NumberCounter value={stats.choferes} /> },
  ];
  const hasData = a.totals.servicios > 0;

  return (
    <PageTransition>
      <PageHeader title="Analytics" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto space-y-lg">
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {kpis.map((k) => (
            <StaggerItem key={k.label}>
              <Card className="p-lg">
                <Icon name={k.icon} className="text-secondary text-[26px] mb-2" />
                <p className="text-headline-lg font-bold text-primary leading-none">{k.node}</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mt-1">{k.label}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {!hasData ? (
          <Card className="p-lg">
            <EmptyState icon="monitoring" title="Aún sin datos" body="Cuando haya traslados registrados, verás aquí las gráficas de servicios, ingresos y distribución." />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              <FadeInOnScroll><Card className="p-lg"><h3 className="text-headline-sm font-semibold mb-4">Servicios por día</h3><ServicesLineChart data={a.weekly} /></Card></FadeInOnScroll>
              <FadeInOnScroll delay={0.08}><Card className="p-lg"><h3 className="text-headline-sm font-semibold mb-4">Ingresos por día ({formatCurrency(a.totals.ingresos)})</h3><RevenueBarChart data={a.weekly} /></Card></FadeInOnScroll>
            </div>
            {a.byStatus.length > 0 && (
              <FadeInOnScroll delay={0.12}>
                <Card className="p-lg max-w-xl"><h3 className="text-headline-sm font-semibold mb-4">Distribución por estado</h3><ServiceTypeDonut data={a.byStatus} /></Card>
              </FadeInOnScroll>
            )}
          </>
        )}
      </main>
    </PageTransition>
  );
}
