import type { Metadata } from "next";
import { getNotifications } from "@/lib/queries";
import { NotificationsList } from "@/components/notifications-list";
import { PushToggle } from "@/components/push-toggle";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition } from "@/components/motion";

export const metadata: Metadata = { title: "Notificaciones" };
export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const notifications = await getNotifications();

  return (
    <PageTransition>
      <PageHeader title="Notificaciones" right={<PushToggle />} />
      <main className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-lg">
        <NotificationsList initial={notifications} />
      </main>
    </PageTransition>
  );
}
