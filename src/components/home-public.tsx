"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Icon } from "@/components/icon";

const SERVICES = [
  { icon: "corporate_fare", title: "Traslados ejecutivos", body: "Servicio puntual para tu equipo y clientes con choferes verificados." },
  { icon: "my_location", title: "Monitoreo en vivo", body: "Cada unidad rastreada por GPS de origen a destino." },
  { icon: "assignment_ind", title: "Coordinación de viajes", body: "Asignamos y confirmamos cada traslado por ti." },
  { icon: "insights", title: "Reportes por empresa", body: "Actividad y consumo por cliente, chofer y periodo." },
];

const STEPS = [
  { n: "01", title: "Solicita", body: "Programa el traslado desde la plataforma." },
  { n: "02", title: "Asignamos", body: "Coordinación te asigna un chofer verificado." },
  { n: "03", title: "En vivo", body: "Sigue el viaje en tiempo real hasta el destino." },
];

const LEGAL = [
  { href: "/legal/terminos", label: "Términos" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/cancelacion", label: "Cancelación" },
  { href: "/legal/eliminar-cuenta", label: "Eliminar cuenta" },
];

const TABS = [
  { href: "#inicio", icon: "home", label: "Inicio" },
  { href: "#servicios", icon: "grid_view", label: "Servicios" },
  { href: "#cobertura", icon: "map", label: "Cobertura" },
];

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export function HomePublic() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden text-white" style={{ background: "#08080c" }}>
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.14), rgba(47,107,255,0.10) 40%, transparent 70%)" }} />

      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: "rgba(8,8,12,0.72)" }}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Image src="/icons/logo.png" alt="MT Empresarial" width={132} height={44} className="h-8 w-auto" priority />
          <SignInButton mode="modal">
            <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/5">Iniciar sesión</button>
          </SignInButton>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
        <section id="inicio" className="flex flex-col items-center pt-16 pb-20 text-center md:pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6">
            <Image src="/icons/logo.png" alt="MT Empresarial" width={220} height={74} className="h-16 w-auto md:h-20" priority />
            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">Logística de confianza para tu empresa</h1>
            <p className="max-w-xl text-base text-white/60 md:text-lg">Traslados corporativos y ejecutivos en Jalisco, coordinados y monitoreados en tiempo real.</p>
            <SignInButton mode="modal">
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-on-primary shadow-lg">
                <Icon name="login" className="text-[18px]" />
                Acceder a la plataforma
              </motion.button>
            </SignInButton>
          </motion.div>
        </section>

        <section id="servicios" className="scroll-mt-20 pb-20">
          <motion.h2 {...fade} className="mb-8 text-center text-2xl font-bold md:text-3xl">Qué ofrecemos</motion.h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SERVICES.map((s, i) => (
              <motion.div key={s.title} {...fade} transition={{ ...fade.transition, delay: i * 0.06 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-white">
                  <Icon name={s.icon} className="text-[22px]" />
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-white/55">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <motion.h2 {...fade} className="mb-8 text-center text-2xl font-bold md:text-3xl">Cómo funciona</motion.h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm font-bold text-white/30">{s.n}</p>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-white/55">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="cobertura" className="scroll-mt-20 pb-20">
          <motion.div {...fade} className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
              <Icon name="pin_drop" className="text-[26px]" />
            </span>
            <h2 className="text-2xl font-bold md:text-3xl">Cobertura en Jalisco</h2>
            <p className="max-w-md text-white/60">Guadalajara, Zapopan, Tlaquepaque, Tonalá y zona metropolitana. Traslados programados y a demanda para empresas.</p>
            <SignInButton mode="modal">
              <button className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-on-primary">
                Acceder a la plataforma
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </SignInButton>
          </motion.div>
        </section>

        <footer className="border-t border-white/10 pt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-white/45 transition hover:text-white/80">{l.label}</Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/30">© {new Date().getFullYear()} MT Empresarial · Logística de confianza</p>
        </footer>
      </main>

      <nav data-vulcano-bottomnav aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 backdrop-blur-xl md:hidden"
        style={{ background: "rgba(8,8,12,0.8)", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        <div className="flex items-center justify-around px-2 py-2">
          {TABS.map((t) => (
            <a key={t.href} href={t.href} className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-white/60 transition hover:text-white">
              <Icon name={t.icon} className="text-[22px]" />
              <span className="text-[11px] font-semibold">{t.label}</span>
            </a>
          ))}
          <SignInButton mode="modal">
            <button className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-white">
              <Icon name="login" className="text-[22px]" />
              <span className="text-[11px] font-semibold">Acceso</span>
            </button>
          </SignInButton>
        </div>
      </nav>
    </div>
  );
}
