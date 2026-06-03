"use client";

import { useState } from "react";
import { MapView } from "@/components/map-view";
import { Icon } from "@/components/icon";
import { GDL_CENTER, services } from "@/lib/mock";
import { PageTransition, SlideIn } from "@/components/motion";

const PHASES = ["En camino", "En el origen", "Servicio iniciado"] as const;

export default function ActiveService() {
  const s = services[0];
  const [phase, setPhase] = useState(0);
  const route: [number, number][] = [
    [-103.37, 20.61], [-103.355, 20.63], [-103.34, 20.655], [-103.325, 20.68],
  ];

  return (
    <PageTransition className="relative h-[calc(100dvh-4rem)] md:h-[100dvh] overflow-hidden -mx-margin-mobile md:mx-0">
      <MapView center={GDL_CENTER} zoom={12.5} className="absolute inset-0 h-full" route={route}
        markers={[{ id: "v", lng: route[0][0], lat: route[0][1], type: "vehicle", label: "JAL-12-AB" }, { id: "d", lng: route[3][0], lat: route[3][1], type: "destination", label: "B" }]} />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-full shadow-lg">
        <span className="w-2 h-2 rounded-full bg-on-tertiary-fixed-variant animate-pulse" />
        <span className="text-label-lg font-semibold">{PHASES[phase]}</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-margin-mobile md:p-margin-desktop pointer-events-none">
        <SlideIn from="bottom" className="pointer-events-auto">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><Icon name="person" fill /></div>
                <div>
                  <p className="text-label-md text-on-surface-variant">Pasajero</p>
                  <h2 className="text-headline-sm font-semibold text-on-surface">{s.passenger}</h2>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-primary-fixed transition-all"><Icon name="call" /></button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-primary-fixed transition-all"><Icon name="chat_bubble" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-outline-variant">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-label-md text-on-surface-variant uppercase tracking-wider">Origen</span></div>
                <p className="text-body-lg font-semibold pl-4">{s.origin}</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" /><span className="text-label-md text-on-surface-variant uppercase tracking-wider">Destino</span></div>
                <p className="text-body-lg font-semibold pl-4">{s.destination}</p>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button className="flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-xl bg-surface-container-lowest border border-outline-variant text-primary shadow-sm hover:bg-primary-fixed transition-all active:scale-95">
                <Icon name="location_on" className="text-headline-md" /><span className="text-[10px] uppercase font-semibold">Llegué</span>
              </button>
              <button onClick={() => setPhase((p) => Math.min(PHASES.length - 1, p + 1))} className="flex-1 h-20 flex items-center justify-center gap-3 rounded-xl bg-primary-container text-white font-bold text-headline-sm shadow-xl hover:bg-primary transition-all active:scale-95">
                <Icon name={phase < PHASES.length - 1 ? "play_arrow" : "check_circle"} fill />
                {phase < PHASES.length - 1 ? "Iniciar servicio" : "Finalizar"}
              </button>
              <button className="flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-xl bg-error-container text-on-error-container shadow-sm hover:bg-error hover:text-white transition-all active:scale-95">
                <Icon name="warning" className="text-headline-md" /><span className="text-[10px] uppercase font-semibold">Alerta</span>
              </button>
            </div>
          </div>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
