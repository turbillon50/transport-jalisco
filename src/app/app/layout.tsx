import { AppShell } from "@/components/shell/app-shell";
import { ensureUser } from "@/lib/sync-user";

export const dynamic = "force-dynamic";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await ensureUser();
  return <AppShell role="user">{children}</AppShell>;
}
