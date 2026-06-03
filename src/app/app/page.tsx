import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/lib/auth";
import { services } from "@/lib/mock";
import { Icon } from "@/components/icon";
import { StatusBadge } from "@/components/status-badge";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard, NumberCounter } from "@/components/motion";

export const metadata: Metadata = { title: "Inicio" };
export const dynamic = "force-dynamic";

export default async function UserHome() {
  const profile = await getProfile();
  const next = services[0];
  const upcoming = services.slice(1, 3);

  return (
    <PageTransition className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-xl">
      <FadeInOnScroll>
        <div className="flex items-center justify-between">
          <h1 className="text-headline-md font-bold text-primary">¡Hola, {profile.name}!</h1>
          <Link href="/app/alerts" className="relative p-2 rounded-full hover:bg-surface-container transition-colors">
            <Icon name="notifications" className="text-on-surface-variant" />
            <span className="absolute top-1 right-1 bg-error text-on-error text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">2</span>
          </Link>
        </div>
      </FadeInOnScroll>

      {/* Próximo traslado — bento card */}
      <FadeInOnScroll delay={0.05}>
        <section>
          <div className="flex justify-between items-center mb-md">
            <h2 className="text-headline-sm font-semibold text-on-surface">Próximo traslado</h2>
            <Link href="/app/active" className="text-label-lg font-semibold text-secondary hover:underline">En vivo</Link>
          </div>
          <div className="bg-primary-container text-white rounded-xl overflow-hidden shadow-lg relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="p-lg relative">
              <div className="flex justify-between items-start mb-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg text-center border-b-2 border-primary">
                    <span className="text-[20px] font-bold leading-none block">{next.day}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{next.month}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-headline-md font-semibold leading-none">{next.time}</p>
                    <span className="inline-flex items-center gap-2 text-label-md bg-white/15 px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" /> Confirmado
                    </span>
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
                  <div><p className="text-white/60 text-label-md">Origen</p><p className="text-body-lg font-semibold">{next.origin}</p></div>
                  <div><p className="text-white/60 text-label-md">Destino</p><p className="text-body-lg font-semibold">{next.destination}</p></div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-md border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Icon name="person" fill /></div>
                <div className="flex-1">
                  <p className="text-white/70 text-label-md">Chofer asignado</p>
                  <p className="text-body-md font-bold">{next.driver}</p>
                  <p className="text-white/50 text-[12px]">{next.vehicle} • {next.plate}</p>
                </div>
                <div className="bg-white text-primary p-2 rounded-full"><Icon name="call" className="text-[20px]" /></div>
              </div>
              <Link href={`/app/service/${next.id}`}>
                <span className="mt-lg block w-full bg-secondary-container hover:bg-secondary text-center text-white py-3 rounded-lg text-label-lg font-semibold transition-all shadow-md">
                  Ver detalle del servicio
                </span>
              </Link>
            </div>
          </div>
        </section>
      </FadeInOnScroll>

      {/* Traslados próximos */}
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
                    <p className="text-outline text-label-md flex items-center gap-1">
                      <Icon name="arrow_forward" className="text-[14px]" /> {s.destination}
                    </p>
                  </div>
                </HoverCard>
              </Link>
            </StaggerItem>
          ))}
          <StaggerItem>
            <Link href="/app/request">
              <div className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-md py-lg hover:border-primary group transition-all cursor-pointer h-full">
                <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-sm group-hover:scale-110 transition-transform">
                  <Icon name="add" />
                </div>
                <p className="text-label-lg font-semibold text-primary">Programar nuevo traslado</p>
              </div>
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* Stats */}
      <FadeInOnScroll>
        <section className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
          <div className="bg-secondary-fixed text-on-secondary-fixed p-lg rounded-xl flex flex-col justify-between">
            <div>
              <Icon name="local_shipping" className="text-secondary text-[32px] mb-md" />
              <h3 className="text-headline-sm font-semibold">Eficiencia de flota</h3>
            </div>
            <div>
              <p className="text-display-lg font-bold"><NumberCounter value={98} suffix="%" /></p>
              <p className="text-label-md opacity-70">Puntualidad este mes</p>
            </div>
          </div>
          <div className="bg-surface-container-high p-lg rounded-xl space-y-md flex flex-col justify-center">
            <p className="text-body-md text-on-surface-variant italic">
              &ldquo;Gracias por confiar en MT Empresarial. Tu destino es nuestra ruta preferida.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" fill className="text-tertiary-fixed-dim text-[18px]" />
                ))}
              </div>
              <span className="text-label-md text-outline">4.9 promedio de usuario</span>
            </div>
          </div>
        </section>
      </FadeInOnScroll>
    </PageTransition>
  );
}
