import type { Metadata } from "next";
import { getNotifications } from "@/lib/queries";
import { NotificationsList } from "@/components/notifications-list";
import { PushToggle } from "@/components/push-toggle";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, FadeInOnScroll } from "@/components/motion";

export const metadata: Metadata = { title: "Notificaciones" };
export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const notifications = await getNotifications();

  return (
    <PageTransition>
      <PageHeader title="Notificaciones" right={<PushToggle />} />
      <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <div className="lg:col-span-8">
          <NotificationsList initial={notifications} />
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
