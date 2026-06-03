import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/lib/auth";
import { getMyServices } from "@/lib/queries";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/ui-bits";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

export const metadata: Metadata = { title: "Inicio" };
export const dynamic = "force-dynamic";

export default async function UserHome() {
  const profile = await getProfile();
  const services = await getMyServices();
  const active = services.find((s) => ["asignado", "confirmado", "en_curso"].includes(s.status)) ?? services[0] ?? null;
  const upcoming = services.filter((s) => s.id !== active?.id && s.status === "pendiente").slice(0, 4);

  return (
    <PageTransition className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-xl">
      <FadeInOnScroll>
        <div className="flex items-center justify-between">
          <h1 className="text-headline-md font-bold text-primary">¡Hola, {profile.name}!</h1>
          <Link href="/app/alerts" className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <Icon name="notifications" className="text-on-surface-variant" />
          </Link>
        </div>
      </FadeInOnScroll>

      <section>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-headline-sm font-semibold text-on-surface">Próximo traslado</h2>
          {active && <Link href="/app/active" className="text-label-lg font-semibold text-secondary hover:underline">En vivo</Link>}
        </div>

        {!active ? (
          <FadeInOnScroll>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
              <EmptyState
                icon="local_taxi"
                title="No tienes traslados aún"
                body="Solicita tu primer traslado y aparecerá aquí con su estado en vivo."
                action={<Link href="/app/request"><Button icon="add">Solicitar traslado</Button></Link>}
              />
            </div>
          </FadeInOnScroll>
        ) : (
          <FadeInOnScroll>
            <Link href={`/app/service/${active.id}`}>
              <HoverCard className="bg-primary-container text-white rounded-xl overflow-hidden shadow-lg relative cursor-pointer">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                <div className="p-lg relative">
                  <div className="flex justify-between items-start mb-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg text-center border-b-2 border-primary">
                        <span className="text-[20px] font-bold leading-none block">{active.day}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{active.month}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-headline-md font-semibold leading-none">{active.time}</p>
                        <span className="inline-flex"><StatusBadge status={active.status} /></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 mb-lg">
                    <div className="flex flex-col items-center pt-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-white" />
                      <div className="w-0.5 h-8 border-l border-dashed border-white/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div><p className="text-white/60 text-label-md">Origen</p><p className="text-body-lg font-semibold">{active.origin}</p></div>
                      <div><p className="text-white/60 text-label-md">Destino</p><p className="text-body-lg font-semibold">{active.destination}</p></div>
                    </div>
                  </div>
                  {active.driverName && (
                    <div className="bg-white/5 rounded-lg p-md border border-white/10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Icon name="person" fill /></div>
                      <div className="flex-1">
                        <p className="text-white/70 text-label-md">Chofer asignado</p>
                        <p className="text-body-md font-bold">{active.driverName}</p>
                        {active.vehicleModel && <p className="text-white/50 text-[12px]">{active.vehicleModel}{active.plate ? ` • ${active.plate}` : ""}</p>}
                      </div>
                    </div>
                  )}
                  <span className="mt-lg block w-full bg-secondary-container text-center text-white py-3 rounded-lg text-label-lg font-semibold shadow-md">
                    Ver detalle del servicio
                  </span>
                </div>
              </HoverCard>
            </Link>
          </FadeInOnScroll>
        )}
      </section>

      {(upcoming.length > 0 || active) && (
        <section>
          <div className="flex justify-between items-center mb-md">
            <h2 className="text-headline-sm font-semibold text-on-surface">Traslados próximos</h2>
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {upcoming.map((s) => (
              <StaggerItem key={s.id}>
                <Link href={`/app/service/${s.id}`}>
                  <HoverCard className="bg-surface-container-low border border-outline-variant p-md rounded-xl cursor-pointer h-full">
                    <div className="flex justify-between mb-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-md text-center min-w-[50px]">
                          <span className="text-[16px] font-bold leading-none block">{s.day}</span>
                          <span className="text-[9px] font-bold uppercase">{s.month}</span>
                        </div>
                        <div>
                          <p className="text-body-lg font-bold text-on-surface">{s.time}</p>
                          <StatusBadge status={s.status} />
                        </div>
                      </div>
                      <Icon name="chevron_right" className="text-outline" />
                    </div>
                    <div className="space-y-1 ml-[62px]">
                      <p className="text-on-surface-variant text-body-md font-medium truncate">{s.origin}</p>
                      <p className="text-outline text-label-md flex items-center gap-1"><Icon name="arrow_forward" className="text-[14px]" /> {s.destination}</p>
                    </div>
                  </HoverCard>
                </Link>
              </StaggerItem>
            ))}
            <StaggerItem>
              <Link href="/app/request">
                <div className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-md py-lg hover:border-primary group transition-all cursor-pointer h-full min-h-[120px]">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-sm group-hover:scale-110 transition-transform"><Icon name="add" /></div>
                  <p className="text-label-lg font-semibold text-primary">Programar nuevo traslado</p>
                </div>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </section>
      )}
    </PageTransition>
  );
}
