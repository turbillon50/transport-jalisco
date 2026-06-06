"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  type: "vehicle" | "incident" | "destination";
  label?: string;
}

const COLORS = { vehicle: "#002863", incident: "#ba1a1a", destination: "#0070ea" };

export function MapView({
  center = [-103.3496, 20.6597],
  zoom = 11.5,
  markers = [],
  route,
  className,
}: {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  route?: [number, number][];
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    let map: import("mapbox-gl").Map | null = null;
    let cancelled = false;

    (async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!container.current || !token) return;
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !container.current) return;
      mapboxgl.accessToken = token;

      const dark = document.documentElement.classList.contains("dark");
      map = new mapboxgl.Map({
        container: container.current,
        style: dark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
        center,
        zoom,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      // Fix mapa gris: el contenedor puede iniciar con alto 0 (transiciones / dvh).
      // Reajustamos el mapa cuando el contenedor obtiene su tamaño real.
      const ro = new ResizeObserver(() => map?.resize());
      ro.observe(container.current);
      roRef.current = ro;
      map.on("load", () => map?.resize());
      setTimeout(() => map?.resize(), 200);

      map.on("load", () => {
        if (!map) return;
        for (const m of markers) {
          const el = document.createElement("div");
          el.style.cssText = `width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;border:2px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.25);background:${COLORS[m.type]};`;
          el.textContent = m.type === "destination" ? m.label ?? "" : m.type === "incident" ? "!" : "▣";
          new mapboxgl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
        }

        if (route && route.length > 1) {
          map.addSource("route", {
            type: "geojson",
            data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route } },
          });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#003d8f", "line-width": 5, "line-opacity": 0.85 },
          });
        }
      });
    })();

    return () => {
      cancelled = true;
      roRef.current?.disconnect();
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("relative w-full overflow-hidden bg-surface-variant", className)}>
      <div ref={container} className="absolute inset-0" />
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-body-md">
          Configura NEXT_PUBLIC_MAPBOX_TOKEN para ver el mapa
        </div>
      )}
    </div>
  );
}
