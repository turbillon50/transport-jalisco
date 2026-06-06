"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Icon } from "@/components/icon";
import { PageTransition, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

// Cada perfil solo es visible para quien tiene ese rol asignado.
// El auto-registro deja rol "user" → solo ve Usuario.
// Chofer y Operaciones SOLO aparecen si un administrador te invitó con ese rol.
const ALL_ROLES = [
  { href: "/app", icon: "person", title: "Usuario", desc: "Solicitar traslados programados", roles: ["user", "driver", "ops", "admin"] },
  { href: "/driver", icon: "directions_car", title: "Chofer", desc: "Servicios asignados (solo por invitación)", roles: ["driver", "admin"] },
  { href: "/ops", icon: "space_dashboard", title: "Operaciones", desc: "Despacho, flota y asignación", roles: ["ops", "admin"] },
];

export default function RolePage() {
  const { user, isLoaded } = useUser();
  const role = ((user?.publicMetadata?.role as string) ?? "user").toLowerCase();
  const visible = isLoaded ? ALL_ROLES.filter((r) => r.roles.includes(role)) : [ALL_ROLES[0]];

  return (
    <PageTransition className="min-h-[100dvh] bg-background text-on-background flex flex-col items-center relative overflow-hidden">
      <div className="fixed bottom-0 left-0 w-full h-1/2 -z-10 pointer-events-none opacity-40">
        <div className="absolute bottom-[-10%] left-[-10%] w-[120%] h-full bg-gradient-to-t from-secondary-fixed-dim to-transparent rounded-full blur-3xl" />
      </div>

      <header className="w-full max-w-[1440px] px-margin-mobile pt-12 pb-8 flex flex-col items-center text-center" style={{ paddingTop: "calc(3rem + env(safe-area-inset-top))" }}>
        <Image src="/icons/logo.png" alt="MT Empresarial" width={288} height={96} className="w-60 md:w-72 h-auto mb-10" priority />
        <h2 className="text-headline-md font-semibold text-on-background">Selecciona tu perfil</h2>
        <p className="text-body-md text-on-surface-variant max-w-xs mx-auto mt-2">
          Elige cómo deseas continuar para personalizar tu experiencia.
        </p>
      </header>

      <StaggerContainer className="w-full max-w-md px-margin-mobile pb-12 space-y-4">
        {visible.map((r) => (
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

      <footer className="mt-auto pb-12 w-full max-w-md px-margin-mobile text-center" style={{ paddingBottom: "calc(3rem + env(safe-area-inset-bottom))" }}>
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
