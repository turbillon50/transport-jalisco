import { AppShell } from "@/components/shell/app-shell";
import { ensureUser } from "@/lib/sync-user";
import { getRole } from "@/lib/auth";
import { getUnreadCount } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function InvitarLayout({ children }: { children: React.ReactNode }) {
  await ensureUser();
  const role = await getRole();
  const unread = await getUnreadCount();
  return <AppShell role={role} unread={unread}>{children}</AppShell>;
}
