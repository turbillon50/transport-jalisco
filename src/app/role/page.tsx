"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { PageTransition, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

const ROLES = [
  { href: "/app", icon: "person", title: "Usuario", desc: "Solicitar traslados programados", primary: true },
  { href: "/driver", icon: "directions_car", title: "Chofer", desc: "Gestionar y realizar servicios asignados", primary: true },
  { href: "/ops", icon: "space_dashboard", title: "Operaciones", desc: "Despacho, flota y asignación de servicios", primary: true },
];

export default function RolePage() {
  return (
    <PageTransition className="min-h-[100dvh] bg-background text-on-background flex flex-col items-center relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 -z-10 pointer-events-none opacity-40">
        <div className="absolute bottom-[-10%] left-[-10%] w-[120%] h-full bg-gradient-to-t from-secondary-fixed-dim to-transparent rounded-full blur-3xl" />
      </div>

      <header className="w-full max-w-[1440px] px-margin-mobile pt-12 pb-8 flex flex-col items-center text-center">
        <Image src="/icons/logo.png" alt="MT Empresarial — Tu destino, nuestra ruta" width={288} height={96} className="w-60 md:w-72 h-auto mb-10" priority />
        <h2 className="text-headline-md font-semibold text-on-background">Selecciona tu perfil</h2>
        <p className="text-body-md text-on-surface-variant max-w-xs mx-auto mt-2">
          Elige cómo deseas continuar para personalizar tu experiencia.
        </p>
      </header>

      <StaggerContainer className="w-full max-w-md px-margin-mobile pb-12 space-y-4">
        {ROLES.map((r) => (
          <StaggerItem key={r.href}>
            <Link href={r.href}>
              <HoverCard
                lift={-3}
                className="w-full flex items-center p-lg bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:border-primary transition-colors group text-left cursor-pointer"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <Icon name={r.icon} fill className="text-3xl" />
                </div>
                <div className="ml-lg flex-grow">
                  <h3 className="text-label-lg font-semibold text-on-background">{r.title}</h3>
                  <p className="text-body-md text-on-surface-variant">{r.desc}</p>
                </div>
                <Icon name="chevron_right" className="text-outline group-hover:text-primary" />
              </HoverCard>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <footer className="mt-auto pb-12 w-full max-w-md px-margin-mobile text-center">
        <Link
          href="/admin"
          className="inline-flex justify-center items-center gap-2 text-outline-variant hover:text-primary transition-colors group"
        >
          <Icon name="shield_person" className="text-sm" />
          <span className="text-[10px] font-semibold uppercase tracking-widest">Acceso Administrativo</span>
        </Link>
      </footer>
    </PageTransition>
  );
}
