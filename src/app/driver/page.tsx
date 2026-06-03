import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/lib/auth";
import { services } from "@/lib/mock";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard, NumberCounter } from "@/components/motion";

export const metadata: Metadata = { title: "Panel del chofer" };
export const dynamic = "force-dynamic";

export default async function DriverDashboard() {
  const profile = await getProfile();
  const active = services[0];
  const next = services.slice(1, 3);

  return (
    <PageTransition className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
      <FadeInOnScroll>
        <div className="flex items-center justify-between mb-xl">
          <div>
            <h1 className="text-headline-md font-bold text-primary">¡Hola, {profile.name}!</h1>
            <span className="text-label-lg text-outline">24 de Mayo, 2024 · Tienes 3 servicios hoy</span>
          </div>
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5" /> DISPONIBLE
          </div>
        </div>
      </FadeInOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* Próximo servicio */}
        <FadeInOnScroll className="md:col-span-8" delay={0.05}>
          <Link href="/app/active">
            <HoverCard className="bg-surface-container-lowest border border-primary/20 rounded-xl overflow-hidden shadow-sm cursor-pointer">
              <div className="bg-primary p-4 flex justify-between items-center text-on-primary">
                <div className="flex items-center gap-3">
                  <Icon name="event_available" className="text-3xl" />
                  <div><p className="text-label-md opacity-80">Próximo servicio</p><h3 className="text-headline-sm font-semibold">{active.time}</h3></div>
                </div>
                <span className="bg-white/20 px-4 py-1.5 rounded-full text-label-lg font-semibold border border-white/30">Asignado</span>
              </div>
              <div className="p-lg grid grid-cols-1 sm:grid-cols-2 gap-lg">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center py-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                    <div className="w-0.5 flex-grow border-l-2 border-dotted border-outline-variant my-1" />
                    <div className="w-2.5 h-2.5 rounded-full bg-error" />
                  </div>
                  <div className="space-y-4">
                    <div><p className="text-label-md text-outline">ORIGEN</p><p className="text-body-lg text-on-surface">{active.origin}</p></div>
                    <div><p className="text-label-md text-outline">DESTINO</p><p className="text-body-lg text-on-surface">{active.destination}</p></div>
                  </div>
                </div>
                <div className="flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-outline-variant pt-lg sm:pt-0 sm:pl-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center"><Icon name="person" className="text-outline" /></div>
                    <div><p className="text-label-md text-outline">PASAJERO</p><p className="text-label-lg font-semibold text-on-surface">{active.passenger}</p></div>
                  </div>
                  <div className="mt-4 bg-surface-container-low p-3 rounded-lg flex items-center gap-2">
                    <Icon name="airport_shuttle" className="text-secondary" />
                    <div><p className="text-[10px] font-bold text-outline">VEHÍCULO</p><p className="text-xs text-on-surface">{active.vehicle}</p></div>
                  </div>
                </div>
              </div>
            </HoverCard>
          </Link>
        </FadeInOnScroll>

        {/* Performance + mapa CTA */}
        <div className="md:col-span-4 space-y-lg">
          <FadeInOnScroll delay={0.1}>
            <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant">
              <h3 className="text-label-lg font-semibold text-on-surface-variant mb-4 uppercase tracking-wider">Tu rendimiento</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-body-md">Calificación</span>
                  <span className="flex items-center font-bold text-primary"><Icon name="star" fill className="text-tertiary-fixed-dim mr-1" /> 4.9</span>
                </div>
                <div className="flex justify-between items-center"><span className="text-body-md">Viajes hoy</span><span className="font-bold text-primary"><NumberCounter value={1} /> / 3</span></div>
                <div className="w-full bg-surface-container rounded-full h-1.5 mt-2"><div className="bg-secondary h-1.5 rounded-full" style={{ width: "33%" }} /></div>
              </div>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.15}>
            <Link href="/driver/map">
              <div className="bg-primary-container p-lg rounded-xl text-white relative overflow-hidden group cursor-pointer">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><Icon name="map" className="text-[100px]" /></div>
                <h3 className="text-headline-sm font-semibold mb-2 relative">Mapa de ruta GPS</h3>
                <p className="text-body-md opacity-80 mb-4 relative">Visualiza el tráfico y tu ruta asignada en tiempo real.</p>
                <span className="inline-block bg-white text-primary font-semibold px-4 py-2 rounded-lg relative">Ver mapa</span>
              </div>
            </Link>
          </FadeInOnScroll>
        </div>

        {/* Próximos */}
        <div className="md:col-span-12 space-y-4">
          <h3 className="text-label-lg font-semibold text-outline px-1 uppercase">Próximos</h3>
          <StaggerContainer className="space-y-3">
            {next.map((s) => (
              <StaggerItem key={s.id}>
                <HoverCard lift={-2} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 cursor-pointer">
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <div className="bg-surface-container-high w-14 h-14 rounded-lg flex flex-col items-center justify-center"><span className="font-bold text-primary">{s.time.slice(0, 5)}</span><span className="text-[10px] text-outline font-bold">{s.time.slice(-2)}</span></div>
                    <div>
                      <p className="text-label-lg font-semibold text-on-surface">{s.origin}</p>
                      <div className="flex items-center gap-1 text-outline"><Icon name="arrow_forward" className="text-sm" /><span className="text-xs">{s.destination}</span></div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 px-lg border-x border-outline-variant"><Icon name="person" className="text-outline" /><div><p className="text-[10px] text-outline font-bold">PASAJERO</p><p className="text-xs font-bold">{s.passenger}</p></div></div>
                  <div className="flex items-center gap-6"><Badge variant="warning">Pendiente</Badge><Icon name="chevron_right" className="text-outline" /></div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
  );
}
