import type { Metadata } from "next";
import { ServicesLineChart, RevenueBarChart, ServiceTypeDonut } from "@/components/charts";
import { Card } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { Icon } from "@/components/icon";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, NumberCounter } from "@/components/motion";

export const metadata: Metadata = { title: "Analytics" };

const KPIS = [
  { icon: "trending_up", label: "Ingresos semana", value: 131, prefix: "$", suffix: "k" },
  { icon: "schedule", label: "Puntualidad", value: 98, suffix: "%" },
  { icon: "group", label: "Usuarios activos", value: 1240 },
  { icon: "star", label: "NPS", value: 72 },
];

export default function AnalyticsPage() {
  return (
    <PageTransition>
      <PageHeader title="Analytics" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto space-y-lg">
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {KPIS.map((k) => (
            <StaggerItem key={k.label}>
              <Card className="p-lg">
                <Icon name={k.icon} className="text-secondary text-[26px] mb-2" />
                <p className="text-headline-lg font-bold text-primary leading-none">
                  <NumberCounter value={k.value} prefix={k.prefix ?? ""} suffix={k.suffix ?? ""} />
                </p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mt-1">{k.label}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <FadeInOnScroll>
            <Card className="p-lg"><h3 className="text-headline-sm font-semibold mb-4">Servicios por día</h3><ServicesLineChart /></Card>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.08}>
            <Card className="p-lg"><h3 className="text-headline-sm font-semibold mb-4">Ingresos por día (MXN)</h3><RevenueBarChart /></Card>
          </FadeInOnScroll>
        </div>

        <FadeInOnScroll delay={0.12}>
          <Card className="p-lg max-w-xl"><h3 className="text-headline-sm font-semibold mb-4">Distribución por tipo de servicio</h3><ServiceTypeDonut /></Card>
        </FadeInOnScroll>
      </main>
    </PageTransition>
  );
}
