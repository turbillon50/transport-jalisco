import type { Metadata } from "next";
import { getFeatureFlags } from "@/lib/queries";
import { FlagsList } from "@/components/flags-list";
import { Card } from "@/components/ui";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, FadeInOnScroll } from "@/components/motion";

export const metadata: Metadata = { title: "Ajustes" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const flags = await getFeatureFlags();

  return (
    <PageTransition>
      <PageHeader title="Ajustes globales" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-3xl mx-auto space-y-lg">
        <FadeInOnScroll>
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <Icon name="flag" className="text-primary" /> Feature flags
          </h2>
          <p className="text-body-md text-on-surface-variant mb-4">Activa o desactiva funcionalidades de la plataforma en tiempo real.</p>
          <FlagsList flags={flags} />
        </FadeInOnScroll>

        <FadeInOnScroll delay={0.1}>
          <Card className="p-lg">
            <h3 className="text-headline-sm font-semibold mb-3 flex items-center gap-2"><Icon name="tune" className="text-primary" /> Configuración general</h3>
            <div className="space-y-3 text-body-md">
              <div className="flex justify-between border-b border-outline-variant pb-3"><span className="text-on-surface-variant">Zona horaria</span><span className="font-semibold">América/Mexico_City (GMT-6)</span></div>
              <div className="flex justify-between border-b border-outline-variant pb-3"><span className="text-on-surface-variant">Moneda</span><span className="font-semibold">MXN — Peso mexicano</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Región operativa</span><span className="font-semibold">Jalisco, México</span></div>
            </div>
          </Card>
        </FadeInOnScroll>
      </main>
    </PageTransition>
  );
}
