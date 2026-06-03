import { AppShell } from "@/components/shell/app-shell";
import { ensureUser } from "@/lib/sync-user";
import { getUnreadCount } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  await ensureUser();
  const unread = await getUnreadCount();
  return <AppShell role="driver" unread={unread}>{children}</AppShell>;
}
