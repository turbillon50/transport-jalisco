import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { ensureUser } from "@/lib/sync-user";
import { getRole } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();
  if (role !== "ops" && role !== "admin") redirect(ROLE_HOME[role]);
  await ensureUser();
  return <AppShell role="ops">{children}</AppShell>;
}
