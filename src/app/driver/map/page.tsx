import type { Metadata } from "next";
import { MapScreen } from "@/components/map-screen";

export const metadata: Metadata = { title: "Mapa GPS" };

export default function DriverMap() {
  const route: [number, number][] = [
    [-103.37, 20.61], [-103.355, 20.63], [-103.34, 20.655], [-103.325, 20.68],
  ];
  return (
    <MapScreen
      zoom={12.5}
      route={route}
      markers={[
        { id: "me", lng: route[0][0], lat: route[0][1], type: "vehicle", label: "Tú" },
        { id: "dest", lng: route[3][0], lat: route[3][1], type: "destination", label: "B" },
      ]}
      stats={[
        { value: "12 km", label: "Distancia", cls: "text-secondary" },
        { value: "18 min", label: "ETA", cls: "text-primary" },
        { value: "08:00", label: "Cita", cls: "text-on-surface" },
        { value: "1", label: "Pasajero", cls: "text-on-surface" },
      ]}
    />
  );
}
