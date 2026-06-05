import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServiceById } from "@/lib/queries";
import { getRole } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { dbUserIdByClerk } from "@/lib/notify";
import { DriverActions } from "@/components/driver-actions";
import { MapView } from "@/components/map-view";
import { PageHeader } from "@/components/shell/page-header";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { RatingForm } from "@/components/rating-form";
import { PageTransition, FadeInOnScroll } from "@/components/motion";

export const metadata: Metadata = { title: "Detalle del servicio" };
export const dynamic = "force-dynamic";

const GDL: [number, number] = [-103.3496, 20.6597];

export default async function ServiceDetail({ params }: { params: { id: string } }) {
  const [service, role] = await Promise.all([getServiceById(params.id), getRole()]);
  if (!service) notFound();
  if (role !== "ops" && role !== "admin") {
    const { userId } = await auth();
    const uid = await dbUserIdByClerk(userId);
    if (!uid || (service.userId !== uid && service.driverId !== uid)) notFound();
  }
  const canDrive = role === "driver" || role === "ops" || role === "admin";

  const route: [number, number][] = [
    [-103.36, 20.62], [-103.35, 20.64], [-103.34, 20.66], [-103.33, 20.68],
  ];

  return (
    <PageTransition className="flex flex-col min-h-[100dvh]">
      <PageHeader title="Detalle del servicio" back />
      <div className="flex-grow flex flex-col md:flex-row max-w-[1440px] mx-auto w-full">
        <section className="relative w-full h-[260px] md:h-auto md:flex-1">
          <MapView center={GDL} markers={[{ id: "o", lng: route[0][0], lat: route[0][1], type: "vehicle" }, { id: "d", lng: route[3][0], lat: route[3][1], type: "destination", label: "B" }]} route={route} className="h-full md:absolute md:inset-0" />
        </section>

        <section className="w-full md:w-[480px] bg-surface flex flex-col px-margin-mobile py-lg gap-lg md:overflow-y-auto">
          <FadeInOnScroll>
            <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl">
              <div className="flex justify-between items-center mb-md">
                <span className="text-label-lg font-semibold text-on-surface-variant">{service.day} {service.month} · {service.time}</span>
                <StatusBadge status={service.status} />
              </div>
              <div className="space-y-lg relative">
                <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-outline-variant" />
                <div className="flex gap-md items-start">
                  <Icon name="radio_button_checked" className="text-primary-container z-10 bg-surface-container-low" />
                  <div><p className="text-label-lg text-on-surface-variant">Origen</p><p className="text-headline-sm font-semibold text-on-surface">{service.origin}</p></div>
                </div>
                <div className="flex gap-md items-start">
                  <Icon name="location_on" className="text-secondary z-10 bg-surface-container-low" />
                  <div><p className="text-label-lg text-on-surface-variant">Destino</p><p className="text-headline-sm font-semibold text-on-surface">{service.destination}</p></div>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          {service.driverName ? (
            <FadeInOnScroll delay={0.05}>
              <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex items-center gap-lg">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><Icon name="person" fill className="text-3xl" /></div>
                <div className="flex-grow">
                  <h3 className="text-headline-sm font-semibold text-on-surface">{service.driverName}</h3>
                  <p className="text-label-lg text-on-surface-variant">Chofer{service.vehicleModel ? ` · ${service.vehicleModel}` : ""}{service.plate ? ` · ${service.plate}` : ""}</p>
                </div>
              </div>
            </FadeInOnScroll>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl text-center text-on-surface-variant text-body-md">
              <Icon name="hourglass_top" className="text-3xl text-outline" />
              <p className="mt-1">Aún sin chofer asignado. Te avisaremos en cuanto se asigne.</p>
            </div>
          )}

          {canDrive && (
            <FadeInOnScroll delay={0.08}>
              <DriverActions serviceId={service.id} status={service.status} />
            </FadeInOnScroll>
          )}

          {service.status === "completado" && (
            <FadeInOnScroll delay={0.1}>
              <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl">
                <RatingForm serviceId={service.id} />
              </div>
            </FadeInOnScroll>
          )}

          <div className="flex gap-md pt-lg mt-auto pb-8 md:pb-0">
            <Button variant="outline" fullWidth icon="chat_bubble">Mensaje</Button>
            <Button fullWidth icon="call" iconFill>Llamar</Button>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
