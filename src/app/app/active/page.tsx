import Link from "next/link";
import type { Metadata } from "next";
import { getActiveService, getServiceDriverLocation } from "@/lib/queries";
import { MapView } from "@/components/map-view";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/ui-bits";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, SlideIn } from "@/components/motion";

export const metadata: Metadata = { title: "Servicio en curso" };
export const dynamic = "force-dynamic";

export default async function ActiveService() {
  const s = await getActiveService();

  if (!s) {
    return (
      <PageTransition>
        <PageHeader title="Servicio en curso" />
        <EmptyState
          icon="navigation"
          title="No tienes un servicio en curso"
          body="Cuando un traslado esté asignado o en camino, podrás seguirlo aquí en vivo."
          action={<Link href="/app/request"><Button icon="add">Solicitar traslado</Button></Link>}
        />
      </PageTransition>
    );
  }

  const hasGeo = s.originLat != null && s.originLng != null && s.destLat != null && s.destLng != null;
  const route: [number, number][] = hasGeo
    ? [
        [s.originLng as number, s.originLat as number],
        [s.destLng as number, s.destLat as number],
      ]
    : [];
  const center: [number, number] | null = hasGeo
    ? [((s.originLng as number) + (s.destLng as number)) / 2, ((s.originLat as number) + (s.destLat as number)) / 2]
    : null;

  // Ubicación en vivo del chofer (si la está compartiendo) + ETA al destino.
  const driverLoc = hasGeo ? await getServiceDriverLocation(s.id) : null;
  const vehLng = driverLoc?.lng ?? (hasGeo ? (s.originLng as number) : 0);
  const vehLat = driverLoc?.lat ?? (hasGeo ? (s.originLat as number) : 0);
  function km(aLat: number, aLng: number, bLat: number, bLng: number) {
    const R = 6371, dLat = ((bLat - aLat) * Math.PI) / 180, dLng = ((bLng - aLng) * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const etaMin = hasGeo ? Math.max(1, Math.round((km(vehLat, vehLng, s.destLat as number, s.destLng as number) / 30) * 60)) : null;

  return (
    <PageTransition className="relative h-[calc(100dvh-8rem)] md:h-[100dvh] overflow-hidden">
      {hasGeo && center ? (
        <MapView center={center} zoom={12.5} className="absolute inset-0 h-full" route={route}
          markers={[{ id: "v", lng: vehLng, lat: vehLat, type: "vehicle", label: s.plate ?? "" }, { id: "d", lng: route[1][0], lat: route[1][1], type: "destination", label: "B" }]} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <EmptyState
            icon="map"
            title="Ubicación en preparación"
            body="Aún no hay coordenadas para este traslado. Te mostraremos el mapa en vivo en cuanto estén disponibles."
          />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 p-margin-mobile md:p-margin-desktop pointer-events-none">
        <SlideIn from="bottom" className="pointer-events-auto">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary" aria-hidden>directions_car</span>
                <div>
                  <p className="text-label-md text-on-surface-variant">Tu traslado</p>
                  <h2 className="text-headline-sm font-semibold text-on-surface">{s.origin} → {s.destination}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {etaMin != null && (
                  <span className="flex items-center gap-1 bg-primary-fixed text-primary text-label-md font-semibold px-3 py-1 rounded-full">
                    <Icon name="schedule" className="text-[16px]" /> ETA {etaMin} min
                  </span>
                )}
                <StatusBadge status={s.status} />
              </div>
            </div>

            {driverLoc && (
              <p className="flex items-center gap-1.5 text-label-md text-secondary -mt-2">
                <Icon name="my_location" className="text-[16px]" /> Ubicación del chofer actualizada {driverLoc.time}
              </p>
            )}

            {s.driverName && (
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center"><Icon name="person" fill /></div>
                  <div>
                    <p className="text-label-md text-on-surface-variant">Chofer</p>
                    <p className="font-semibold text-on-surface">{s.driverName}</p>
                    {s.vehicleModel && <p className="text-label-md text-on-surface-variant">{s.vehicleModel}{s.plate ? ` • ${s.plate}` : ""}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name="call" /></button>
                  <button className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name="chat_bubble" /></button>
                </div>
              </div>
            )}
          </div>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
