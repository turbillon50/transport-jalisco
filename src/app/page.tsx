import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard, NumberCounter } from "@/components/motion";

const FEATURES = [
  { icon: "schedule", title: "Traslados programados", body: "Solicita y agenda servicios ejecutivos con confirmación inmediata y chofer asignado." },
  { icon: "my_location", title: "Rastreo en vivo", body: "Sigue cada unidad en tiempo real sobre Mapbox, con ETA y estado del servicio." },
  { icon: "local_shipping", title: "Gestión de flota", body: "Monitorea unidades, mantenimiento y disponibilidad desde un panel operativo único." },
  { icon: "badge", title: "Choferes verificados", body: "Personal con documentación al día, calificaciones y asignación inteligente." },
  { icon: "insights", title: "Analítica operativa", body: "KPIs de puntualidad, ingresos y demanda con tableros para tomar decisiones." },
  { icon: "verified_user", title: "Seguridad primero", body: "Alertas SOS, bitácora de eventos y trazabilidad completa de cada trayecto." },
];

const STATS = [
  { value: 42, label: "Unidades en flota", suffix: "" },
  { value: 98, label: "Puntualidad", suffix: "%" },
  { value: 4, label: "Calificación promedio", suffix: ".9" },
  { value: 12000, label: "Traslados completados", suffix: "+" },
];

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const { userId } = await auth();
  const loggedIn = !!userId;
  return (
    <div className="min-h-[100dvh] bg-background text-on-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass-effect border-b border-outline-variant" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="max-w-6xl mx-auto px-margin-mobile md:px-8 min-h-16 py-2 flex items-center justify-between">
          <Image src="/icons/logo.png" alt="MT Empresarial" width={150} height={40} className="h-9 w-auto" priority />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {loggedIn ? (
              <Link href="/role"><Button size="sm" icon="arrow_forward">Ir a mi panel</Button></Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden sm:inline-flex px-4 py-2 text-label-lg font-semibold text-primary hover:underline">
                  Iniciar sesión
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" icon="arrow_forward">Comenzar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh text-white">
        <div className="absolute inset-0 road-pattern animate-subtle-drift pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-margin-mobile md:px-8 py-24 md:py-32 text-center">
          <FadeInOnScroll>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-label-md uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse" /> Logística de Confianza · Jalisco
            </span>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.08}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Transporte empresarial<br />
              <span className="text-secondary-fixed-dim">Tu destino, nuestra ruta.</span>
            </h1>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.16}>
            <p className="max-w-2xl mx-auto text-lg text-white/80 mb-10">
              Solicita traslados, gestiona tu flota y rastrea cada servicio en tiempo real desde una sola
              plataforma diseñada para operaciones de alto nivel.
            </p>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.24}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={loggedIn ? "/role" : "/sign-up"}>
                <Button size="lg" icon="rocket_launch" className="bg-secondary-container hover:bg-secondary">
                  {loggedIn ? "Ir a mi panel" : "Crear cuenta gratis"}
                </Button>
              </Link>
              <Link href="/role">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Ver la plataforma
                </Button>
              </Link>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-margin-mobile md:px-8 -mt-12 relative z-10">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center shadow-sm">
                <p className="text-display-lg font-bold text-primary leading-none">
                  <NumberCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-label-md text-on-surface-variant mt-2 uppercase tracking-wider">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-margin-mobile md:px-8 py-24">
        <FadeInOnScroll className="text-center mb-14">
          <h2 className="text-headline-lg font-bold text-on-surface mb-3">Todo lo que tu operación necesita</h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Una suite completa para usuarios, choferes y operaciones — con el rigor de una empresa de logística premium.
          </p>
        </FadeInOnScroll>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <HoverCard className="h-full bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-4">
                  <Icon name={f.icon} fill className="text-[26px]" />
                </div>
                <h3 className="text-headline-sm font-semibold text-on-surface mb-2">{f.title}</h3>
                <p className="text-body-md text-on-surface-variant">{f.body}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-margin-mobile md:px-8 pb-24">
        <FadeInOnScroll>
          <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-10 md:p-16 text-center">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para mover tu empresa?</h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Únete a MT Empresarial y digitaliza tus traslados corporativos hoy mismo.
              </p>
              <Link href={loggedIn ? "/role" : "/sign-up"}>
                <Button size="lg" icon="arrow_forward" className="bg-secondary text-white hover:brightness-105">
                  {loggedIn ? "Ir a mi panel" : "Empezar ahora"}
                </Button>
              </Link>
            </div>
          </div>
        </FadeInOnScroll>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant">
        <div className="max-w-6xl mx-auto px-margin-mobile md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant">
          <div className="flex items-center gap-3">
            <Image src="/icons/logo.png" alt="MT Empresarial" width={120} height={32} className="h-7 w-auto" />
          </div>
          <p className="text-body-md">© {new Date().getFullYear()} MT Empresarial · Logística de Confianza</p>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:text-primary">Iniciar sesión</Link>
            <Link href="/role" className="hover:text-primary">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
