import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { ensureUser } from "@/lib/sync-user";
import { getUnreadCount } from "@/lib/queries";
import { getRole } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();
  if (role !== "driver" && role !== "admin") redirect(ROLE_HOME[role]);
  await ensureUser();
  const unread = await getUnreadCount();
  return <AppShell role="driver" unread={unread}>{children}</AppShell>;
}
