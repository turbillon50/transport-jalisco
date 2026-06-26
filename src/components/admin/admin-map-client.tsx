"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";

export function AdminMapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let map: any;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) { setError(true); return; }
    import("mapbox-gl").then((mapboxgl) => {
      if (!containerRef.current) return;
      try {
        (mapboxgl.default as any).accessToken = token;
        map = new (mapboxgl.default as any).Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [-103.35, 20.66],
          zoom: 11,
        });
        map.on("load", () => setLoaded(true));
        map.on("error", () => setError(true));
      } catch { setError(true); }
    }).catch(() => setError(true));
    return () => { try { map?.remove(); } catch {} };
  }, []);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-surface-container text-on-surface-variant">
        <Icon name="map_off" className="text-[48px] opacity-40" />
        <p className="text-title-sm">Mapa no disponible</p>
        <p className="text-body-sm opacity-60">Verifica el token de Mapbox</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container z-10">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
