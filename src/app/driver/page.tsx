import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/lib/auth";
import { getDriverServices, getMyRating } from "@/lib/queries";
import { Icon } from "@/components/icon";
import { StatusBadge } from "@/components/status-badge";
import { Stars, EmptyState } from "@/components/ui-bits";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

export const metadata: Metadata = { title: "Panel del chofer" };
export const dynamic = "force-dynamic";

export default async function DriverDashboard() {
  const [profile, services, rating] = await Promise.all([getProfile(), getDriverServices(), getMyRating()]);
  const today = services.filter((s) => ["asignado", "confirmado", "en_curso"].includes(s.status));

  return (
    <PageTransition className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto space-y-lg">
      <FadeInOnScroll>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-md font-bold text-primary">¡Hola, {profile.name}!</h1>
            <span className="text-label-lg text-outline">{services.length} servicios en tu historial</span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-high px-3 py-1.5 rounded-full">
            <Stars value={rating.avg} size={14} />
            <span className="text-label-md font-semibold text-on-surface">{rating.avg ?? "—"}</span>
          </div>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.05}>
        <Link href="/driver/map">
          <HoverCard className="bg-primary-container p-lg rounded-xl text-white relative overflow-hidden cursor-pointer">
            <div className="absolute -right-4 -bottom-4 opacity-10"><Icon name="map" className="text-[100px]" /></div>
            <h3 className="text-headline-sm font-semibold mb-1 relative">Mapa GPS en vivo</h3>
            <p className="text-body-md opacity-80 relative">Visualiza tu ruta y el tráfico en tiempo real.</p>
          </HoverCard>
        </Link>
      </FadeInOnScroll>

      <section>
        <h3 className="text-label-lg font-semibold text-outline px-1 uppercase mb-3">Tus servicios</h3>
        {services.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
            <EmptyState icon="event_busy" title="Sin servicios asignados" body="Cuando operaciones te asigne un traslado, aparecerá aquí." />
          </div>
        ) : (
          <StaggerContainer className="space-y-3">
            {(today.length ? today : services).map((s) => (
              <StaggerItem key={s.id}>
                <Link href={`/app/service/${s.id}`}>
                  <HoverCard lift={-2} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center justify-between gap-4 cursor-pointer">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="bg-surface-container-high w-14 h-14 rounded-lg flex flex-col items-center justify-center shrink-0">
                        <span className="font-bold text-primary text-sm">{s.time.slice(0, 5)}</span>
                        <span className="text-[10px] text-outline font-bold">{s.month}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-label-lg font-semibold text-on-surface truncate">{s.origin}</p>
                        <p className="flex items-center gap-1 text-outline text-xs truncate"><Icon name="arrow_forward" className="text-sm" /> {s.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0"><StatusBadge status={s.status} /><Icon name="chevron_right" className="text-outline" /></div>
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
