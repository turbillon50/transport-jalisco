import Link from "next/link";
import type { Metadata } from "next";
import { getOpsStats, getUnassignedServices } from "@/lib/queries";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/ui-bits";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard, NumberCounter } from "@/components/motion";

export const metadata: Metadata = { title: "Centro de operaciones" };
export const dynamic = "force-dynamic";

export default async function OpsDashboard() {
  const [stats, pending] = await Promise.all([getOpsStats(), getUnassignedServices()]);
  const cards = [
    { label: "Servicios activos", value: stats.hoy, foot: "Programados", dot: "bg-secondary" },
    { label: "En curso", value: stats.enCurso, foot: "En ruta", dot: "bg-tertiary-fixed-dim" },
    { label: "Pendientes", value: stats.pendientes, foot: "Por asignar", icon: "error" },
    { label: "Choferes", value: stats.choferes, foot: "Registrados", dot: "bg-green-500" },
  ];

  return (
    <PageTransition className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
      <FadeInOnScroll>
        <h1 className="text-headline-md font-bold text-primary mb-lg">Centro de operaciones</h1>
      </FadeInOnScroll>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {cards.map((s) => (
          <StaggerItem key={s.label}>
            <HoverCard lift={-3} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-between h-36">
              <div>
                <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">{s.label}</span>
                <h2 className="text-display-lg font-bold text-primary leading-none"><NumberCounter value={s.value} /></h2>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                {s.icon ? <Icon name={s.icon} className="text-sm text-error" /> : <span className={`w-2 h-2 rounded-full ${s.dot}`} />}
                <span className="text-label-md">{s.foot}</span>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <section>
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-headline-sm font-semibold text-on-surface">Servicios sin asignar</h3>
          <Link href="/ops/assignments" className="text-secondary text-label-lg font-semibold hover:underline">Asignar</Link>
        </div>
        {pending.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
            <EmptyState icon="task_alt" title="Todo asignado" body="No hay traslados pendientes por asignar." />
          </div>
        ) : (
          <StaggerContainer className="space-y-sm">
            {pending.map((s) => (
              <StaggerItem key={s.id}>
                <Link href="/ops/assignments">
                  <HoverCard lift={-2} className="flex items-center justify-between p-lg bg-surface-container-lowest border border-outline-variant rounded-xl cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error"><Icon name="schedule" /></div>
                      <div>
                        <p className="text-body-lg font-bold text-on-surface">{s.origin} → {s.destination}</p>
                        <p className="text-body-md text-on-surface-variant">{s.day} {s.month} · {s.time} · {s.passengers} pax</p>
                      </div>
                    </div>
                    <Icon name="chevron_right" className="text-outline group-hover:text-primary transition-colors" />
                  </HoverCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>
    </PageTransition>
  );
}
