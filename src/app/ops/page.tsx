import Link from "next/link";
import type { Metadata } from "next";
import { dispatchStats } from "@/lib/mock";
import { Icon } from "@/components/icon";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard, NumberCounter } from "@/components/motion";

export const metadata: Metadata = { title: "Centro de operaciones" };

const STATS = [
  { key: "hoy", value: dispatchStats.hoy, label: "Servicios hoy", foot: "Programados", dot: "bg-secondary" },
  { key: "enCurso", value: dispatchStats.enCurso, label: "En curso", foot: "Activos", dot: "bg-tertiary-fixed-dim" },
  { key: "pendientes", value: dispatchStats.pendientes, label: "Pendientes", foot: "Por asignar", icon: "error" },
  { key: "choferes", value: dispatchStats.choferes, label: "Choferes", foot: "Disponibles", dot: "bg-green-500" },
];

const ALERTS = [
  { icon: "error", tone: "bg-error-container text-error", title: "3 servicios sin asignar", body: "Requieren atención inmediata para el turno matutino", href: "/ops/assignments" },
  { icon: "warning", tone: "bg-tertiary-container/20 text-tertiary-fixed-dim", title: "2 retrasos reportados", body: "Tráfico intenso reportado en Zona Metropolitana", href: "/ops/map" },
  { icon: "report", tone: "bg-tertiary-container/20 text-tertiary-fixed-dim", title: "1 incidencia abierta", body: "Unidad JAL-12-AB reporta falla mecánica leve", href: "/ops/fleet" },
];

export default function OpsDashboard() {
  return (
    <PageTransition className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
      <FadeInOnScroll>
        <h1 className="text-headline-md font-bold text-primary mb-lg">Dashboard · 24 de Mayo, 2024</h1>
      </FadeInOnScroll>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {STATS.map((s) => (
          <StaggerItem key={s.key}>
            <HoverCard lift={-3} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-between h-40">
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
          <h3 className="text-headline-sm font-semibold text-on-surface">Alertas</h3>
          <Link href="/ops/assignments" className="text-secondary text-label-lg font-semibold hover:underline">Ver todas</Link>
        </div>
        <StaggerContainer className="space-y-sm">
          {ALERTS.map((a) => (
            <StaggerItem key={a.title}>
              <Link href={a.href}>
                <HoverCard lift={-2} className="flex items-center justify-between p-lg bg-surface-container-lowest border border-outline-variant rounded-xl cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.tone}`}><Icon name={a.icon} fill /></div>
                    <div>
                      <p className="text-body-lg font-bold text-on-surface">{a.title}</p>
                      <p className="text-body-md text-on-surface-variant">{a.body}</p>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="text-outline group-hover:text-primary transition-colors" />
                </HoverCard>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <FadeInOnScroll className="mt-xl">
        <Link href="/ops/map">
          <div className="h-48 w-full rounded-xl overflow-hidden relative border border-outline-variant group cursor-pointer bg-primary-container">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="absolute inset-0 flex items-center justify-center text-white/40"><Icon name="map" className="text-[120px]" /></div>
            <div className="absolute bottom-4 left-4 bg-surface-container-lowest/90 backdrop-blur px-3 py-1 rounded-full border border-primary/20 flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
              <span className="text-xs font-bold text-primary">Vista operativa en vivo</span>
            </div>
          </div>
        </Link>
      </FadeInOnScroll>
    </PageTransition>
  );
}
