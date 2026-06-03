"use client";

import { MapView, type MapMarker } from "@/components/map-view";
import { PageTransition, SlideIn } from "@/components/motion";

const GDL_CENTER: [number, number] = [-103.3496, 20.6597];

interface Stat { value: number | string; label: string; cls: string }

export function MapScreen({
  markers = [],
  route,
  stats,
  zoom = 11.5,
}: {
  markers?: MapMarker[];
  route?: [number, number][];
  stats: Stat[];
  zoom?: number;
}) {
  return (
    <PageTransition className="relative h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-hidden">
      <MapView center={GDL_CENTER} zoom={zoom} markers={markers} route={route} className="absolute inset-0 h-full" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 pointer-events-none">
        <SlideIn from="bottom" className="pointer-events-auto">
          <div className="w-full md:max-w-4xl mx-auto bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-4 border border-outline-variant shadow-lg grid grid-cols-4 gap-2 md:gap-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`flex flex-col items-center px-2 ${i < stats.length - 1 ? "border-r border-outline-variant" : ""}`}>
                <span className={`text-headline-md font-semibold ${s.cls}`}>{s.value}</span>
                <span className="text-on-surface-variant text-[10px] md:text-label-md uppercase tracking-wider text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
