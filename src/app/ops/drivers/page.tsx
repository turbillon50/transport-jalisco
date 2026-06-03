import Image from "next/image";
import type { Metadata } from "next";
import { getDrivers } from "@/lib/queries";
import { Icon } from "@/components/icon";
import { Input } from "@/components/ui";
import { Stars, EmptyState } from "@/components/ui-bits";
import { PageTransition, FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

export const metadata: Metadata = { title: "Gestión de choferes" };
export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <PageTransition className="max-w-[1440px] mx-auto p-margin-mobile md:p-margin-desktop">
      <FadeInOnScroll>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-xl">
          <div>
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-semibold text-primary mb-1">Gestión de choferes</h2>
            <p className="text-body-md text-on-surface-variant">{drivers.length} choferes registrados.</p>
          </div>
          <div className="md:w-72"><Input icon="search" placeholder="Buscar por nombre…" /></div>
        </div>
      </FadeInOnScroll>

      {drivers.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
          <EmptyState icon="badge" title="Sin choferes aún" body="Asigna el rol 'driver' a un usuario desde el panel de administración para que aparezca aquí." />
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {drivers.map((d) => (
            <StaggerItem key={d.id}>
              <HoverCard className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col gap-md h-full">
                <div className="flex gap-md items-center">
                  {d.avatarUrl ? (
                    <Image src={d.avatarUrl} alt={d.name} width={56} height={56} className="w-14 h-14 rounded-full object-cover border-2 border-surface-variant" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center"><Icon name="person" fill /></div>
                  )}
                  <div>
                    <h3 className="text-headline-sm font-semibold text-on-surface">{d.name}</h3>
                    <Stars value={d.rating ? Number(d.rating) : null} size={14} />
                  </div>
                </div>
                <div className="space-y-1 text-body-md">
                  <div className="flex justify-between py-1 border-b border-surface-variant"><span className="text-on-surface-variant">Correo</span><span className="font-semibold text-on-surface truncate max-w-[160px]">{d.email}</span></div>
                  <div className="flex justify-between py-1"><span className="text-on-surface-variant">Alta</span><span className="font-semibold text-on-surface">{new Date(d.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
}
