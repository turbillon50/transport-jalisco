"use client";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Icon } from "@/components/icon";

type Unit = {
  serviceId: string; status: string; origin: string; destination: string;
  driver: string; lat: number; lng: number; at: string;
};

const STATUS_ES: Record<string, string> = { asignado: "Asignado", confirmado: "Confirmado", en_curso: "En curso" };

function minsAgo(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return m <= 0 ? "ahora" : m === 1 ? "hace 1 min" : `hace ${m} min`;
}

export function AdminMapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const fitted = useRef(false);

  // 1) Mapa base
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
          center: [-103.35, 20.66], // GDL
          zoom: 11,
        });
        map.addControl(new (mapboxgl.default as any).NavigationControl({ showCompass: false }), "top-right");
        map.on("load", () => setLoaded(true));
        map.on("error", () => setError(true));
        mapRef.current = map;
      } catch { setError(true); }
    }).catch(() => setError(true));
    return () => { try { map?.remove(); } catch {} };
  }, []);

  // 2) Flota en vivo (poll 20s, igual que el pinger del chofer)
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/admin/fleet", { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (alive && Array.isArray(d.units)) {
          setUnits(d.units);
          setUpdatedAt(new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }));
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 20000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  // 3) Pintar/actualizar marcadores
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    import("mapbox-gl").then((mapboxgl) => {
      const seen = new Set<string>();
      units.forEach((u) => {
        seen.add(u.serviceId);
        const html = `<div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.5;color:#111">
          <strong style="font-size:13px">${u.driver}</strong><br>
          ${STATUS_ES[u.status] ?? u.status} · ${minsAgo(u.at)}<br>
          <span style="opacity:.7">${u.origin} → ${u.destination}</span></div>`;
        const existing = markersRef.current.get(u.serviceId);
        if (existing) {
          existing.setLngLat([u.lng, u.lat]);
          existing.getPopup()?.setHTML(html);
        } else {
          const el = document.createElement("div");
          el.style.cssText = "width:34px;height:34px;border-radius:50%;background:#111;border:2px solid #fff;display:grid;place-items:center;box-shadow:0 4px 12px rgba(0,0,0,.4);cursor:pointer";
          el.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17a2 2 0 1 0 4 0M5 17V9l2-4h10l2 4v8M15 17a2 2 0 1 0 4 0M7 9h10"/></svg>`;
          const popup = new (mapboxgl.default as any).Popup({ offset: 20, closeButton: false }).setHTML(html);
          const mk = new (mapboxgl.default as any).Marker({ element: el })
            .setLngLat([u.lng, u.lat]).setPopup(popup).addTo(map);
          markersRef.current.set(u.serviceId, mk);
        }
      });
      // limpiar unidades que ya no están activas
      markersRef.current.forEach((mk, id) => {
        if (!seen.has(id)) { mk.remove(); markersRef.current.delete(id); }
      });
      // encuadrar la primera vez que hay unidades
      if (!fitted.current && units.length > 0) {
        fitted.current = true;
        const b = new (mapboxgl.default as any).LngLatBounds();
        units.forEach((u) => b.extend([u.lng, u.lat]));
        map.fitBounds(b, { padding: 80, maxZoom: 14, duration: 800 });
      }
    });
  }, [units, loaded]);

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
      <div style={{ position: "absolute", left: 12, top: 12, zIndex: 5, background: "rgba(17,17,17,.85)", color: "#fff", borderRadius: 10, padding: "10px 14px", fontFamily: "Inter,sans-serif", backdropFilter: "blur(8px)" }}>
        <p style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: units.length ? "#4ade80" : "#9ca3af", display: "inline-block" }} />
          {units.length} unidad{units.length === 1 ? "" : "es"} en vivo
        </p>
        <p style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>
          {units.length === 0 ? "Sin viajes activos compartiendo ubicación" : `Actualizado ${updatedAt} · cada 20s`}
        </p>
      </div>
    </div>
  );
}
