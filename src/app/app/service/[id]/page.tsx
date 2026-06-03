import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { services, GDL_CENTER } from "@/lib/mock";
import { MapView } from "@/components/map-view";
import { PageHeader } from "@/components/shell/page-header";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { PageTransition, FadeInOnScroll } from "@/components/motion";

export const metadata: Metadata = { title: "Detalle del servicio" };

export default function ServiceDetail({ params }: { params: { id: string } }) {
  const service = services.find((s) => s.id === params.id) ?? services[0];
  if (!service) notFound();

  const route: [number, number][] = [
    [-103.36, 20.62],
    [-103.35, 20.64],
    [-103.34, 20.66],
    [-103.33, 20.68],
  ];

  return (
    <PageTransition className="flex flex-col min-h-[100dvh]">
      <PageHeader title="Detalle del servicio" back />
      <div className="flex-grow flex flex-col md:flex-row max-w-[1440px] mx-auto w-full">
        <section className="relative w-full h-[300px] md:h-auto md:flex-1">
          <MapView center={GDL_CENTER} markers={[{ id: "o", lng: route[0][0], lat: route[0][1], type: "vehicle" }, { id: "d", lng: route[3][0], lat: route[3][1], type: "destination", label: "B" }]} route={route} className="h-full md:absolute md:inset-0" />
        </section>

        <section className="w-full md:w-[480px] bg-surface flex flex-col px-margin-mobile py-lg gap-lg md:overflow-y-auto">
          <FadeInOnScroll>
            <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl">
              <div className="flex justify-between items-center mb-md">
                <span className="text-label-lg font-semibold text-on-surface-variant">{service.day} {service.month} 2024 · {service.time}</span>
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

          <FadeInOnScroll delay={0.05}>
            <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex items-center gap-lg">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><Icon name="person" fill className="text-3xl" /></div>
              <div className="flex-grow">
                <h3 className="text-headline-sm font-semibold text-on-surface">{service.driver}</h3>
                <div className="flex items-center gap-1">
                  <p className="text-label-lg text-on-surface-variant">Chofer</p>
                  <Icon name="star" fill className="text-tertiary-fixed-dim text-sm" />
                  <span className="text-label-lg text-on-surface">4.9</span>
                </div>
              </div>
              <button className="text-primary hover:bg-primary-fixed transition-colors p-2 rounded-full"><Icon name="info" /></button>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.1}>
            <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex gap-lg">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center border border-outline-variant"><Icon name="airport_shuttle" className="text-primary text-4xl" /></div>
              <div className="flex-grow space-y-1">
                <h3 className="text-label-lg font-bold text-on-surface">{service.vehicle}</h3>
                <div className="grid grid-cols-2 gap-x-md gap-y-1 text-label-md">
                  <p className="text-on-surface-variant">Placas:</p><p className="font-bold text-on-surface">{service.plate}</p>
                  <p className="text-on-surface-variant">Color:</p><p className="text-on-surface">Blanco</p>
                  <p className="text-on-surface-variant">Capacidad:</p><p className="text-on-surface">{service.passengers} pax</p>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          <div className="flex gap-md pt-lg mt-auto pb-8 md:pb-0">
            <Button variant="outline" fullWidth icon="chat_bubble">Mensaje</Button>
            <Button fullWidth icon="call" iconFill>Llamar</Button>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
