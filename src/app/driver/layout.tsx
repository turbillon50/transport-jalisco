import { AppShell } from "@/components/shell/app-shell";
import { ensureUser } from "@/lib/sync-user";

export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  await ensureUser();
  return <AppShell role="driver">{children}</AppShell>;
}
