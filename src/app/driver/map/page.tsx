import type { Metadata } from "next";
import { MapScreen } from "@/components/map-screen";
import { DriverLocationPinger } from "@/components/driver-location-pinger";
import { getDriverActiveGeo } from "@/lib/queries";

export const metadata: Metadata = { title: "Mapa GPS" };
export const dynamic = "force-dynamic";

/** Distancia haversine en km. */
function km(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default async function DriverMap() {
  const svc = await getDriverActiveGeo();
  const hasGeo =
    svc?.originLat != null && svc?.originLng != null && svc?.destLat != null && svc?.destLng != null;

  if (!svc || !hasGeo) {
    return (
      <MapScreen
        markers={[]}
        stats={[
          { value: "—", label: "Distancia", cls: "text-secondary" },
          { value: "—", label: "ETA", cls: "text-primary" },
          { value: svc?.time ?? "—", label: "Cita", cls: "text-on-surface" },
          { value: svc ? "Sin GPS" : "Sin servicio", label: "Estado", cls: "text-on-surface-variant" },
        ]}
      />
    );
  }

  const dist = km(svc.originLat!, svc.originLng!, svc.destLat!, svc.destLng!);
  const etaMin = Math.max(1, Math.round((dist / 30) * 60)); // 30 km/h promedio urbano
  const route: [number, number][] = [
    [svc.originLng!, svc.originLat!],
    [svc.destLng!, svc.destLat!],
  ];

  return (
    <div className="relative">
      <div className="absolute top-3 left-3 z-20">
        <DriverLocationPinger serviceId={svc.id} />
      </div>
      <MapScreen
        zoom={12.5}
        route={route}
        markers={[
          { id: "me", lng: svc.originLng!, lat: svc.originLat!, type: "vehicle", label: "Tú" },
          { id: "dest", lng: svc.destLng!, lat: svc.destLat!, type: "destination", label: svc.destination },
        ]}
        stats={[
          { value: `${dist.toFixed(1)} km`, label: "Distancia", cls: "text-secondary" },
          { value: `${etaMin} min`, label: "ETA", cls: "text-primary" },
          { value: svc.time, label: "Cita", cls: "text-on-surface" },
          { value: svc.passengers, label: svc.passengers === 1 ? "Pasajero" : "Pasajeros", cls: "text-on-surface" },
        ]}
      />
    </div>
  );
}
