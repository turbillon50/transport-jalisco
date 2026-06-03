import { AppShell } from "@/components/shell/app-shell";
import { ensureUser } from "@/lib/sync-user";
import { getUnreadCount } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await ensureUser();
  const unread = await getUnreadCount();
  return <AppShell role="user" unread={unread}>{children}</AppShell>;
}
