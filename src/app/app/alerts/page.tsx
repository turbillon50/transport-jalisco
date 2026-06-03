import type { Metadata } from "next";
import { notifications } from "@/lib/mock";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, StaggerContainer, StaggerItem, FadeInOnScroll } from "@/components/motion";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notificaciones" };

const toneCls: Record<string, string> = {
  primary: "bg-primary-container text-on-primary-fixed",
  secondary: "bg-secondary-container text-on-secondary-container",
  error: "bg-error text-on-error",
  muted: "bg-surface-variant text-on-surface-variant",
};

export default function AlertsPage() {
  const nuevas = notifications.filter((n) => n.unread);
  const anteriores = notifications.filter((n) => !n.unread);

  return (
    <PageTransition>
      <PageHeader title="Notificaciones" />
      <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <div className="lg:col-span-8 space-y-xl">
          <section>
            <div className="flex justify-between items-end mb-sm px-1">
              <h2 className="text-label-lg font-semibold text-outline uppercase tracking-wider">Nuevas</h2>
              <button className="text-secondary text-label-md font-semibold hover:underline">Marcar todas como leídas</button>
            </div>
            <StaggerContainer className="space-y-sm">
              {nuevas.map((n) => (
                <StaggerItem key={n.id}>
                  <div className={cn("border rounded-xl p-md flex gap-md items-start cursor-pointer transition-all hover:border-primary",
                    n.tone === "error" ? "bg-error-container border-error" : "bg-surface-container-lowest border-outline-variant")}>
                    <div className={cn("flex-shrink-0 p-sm rounded-lg", toneCls[n.tone])}>
                      <Icon name={n.icon} fill />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-label-lg font-semibold text-on-surface">{n.title}</h3>
                        <span className="text-label-md text-on-surface-variant">{n.time}</span>
                      </div>
                      <p className="text-body-md text-on-surface-variant mt-xs">{n.body}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary mt-2" />
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          <section>
            <h2 className="text-label-lg font-semibold text-outline uppercase tracking-wider mb-sm px-1">Anteriores</h2>
            <div className="space-y-sm">
              {anteriores.map((n) => (
                <div key={n.id} className="bg-surface-container border border-outline-variant rounded-xl p-md flex gap-md items-start opacity-75 hover:opacity-100 transition-opacity">
                  <div className={cn("flex-shrink-0 p-sm rounded-lg", toneCls[n.tone])}><Icon name={n.icon} fill /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-label-lg font-semibold text-on-surface">{n.title}</h3>
                      <span className="text-label-md text-on-surface-variant">{n.time}</span>
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-xs">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <FadeInOnScroll className="hidden lg:block lg:col-span-4 space-y-lg" delay={0.1}>
          <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl">
            <h4 className="text-headline-sm font-semibold text-primary mb-md">Estado del servicio</h4>
            <div className="flex items-center gap-md mb-lg">
              <div className="relative w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary border-2 border-primary">
                <Icon name="person" fill />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-surface rounded-full" />
              </div>
              <div>
                <p className="text-label-lg font-semibold text-on-surface">Carlos Hernández</p>
                <p className="text-label-md text-outline">En ruta al punto de origen</p>
              </div>
            </div>
            <div className="space-y-sm text-body-md">
              <div className="flex justify-between"><span className="text-outline">Vehículo</span><span className="font-semibold">Toyota Hiace</span></div>
              <div className="flex justify-between"><span className="text-outline">Placas</span><span className="font-semibold">JAL-12-AB</span></div>
              <div className="flex justify-between"><span className="text-outline">ETA Estimada</span><span className="text-secondary font-bold">07:58 AM</span></div>
            </div>
            <Button fullWidth className="mt-lg" icon="call">Contactar chofer</Button>
          </div>
        </FadeInOnScroll>
      </main>
    </PageTransition>
  );
}
