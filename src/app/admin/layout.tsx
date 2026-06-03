import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getRole } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();
  // Superadmin area: only the admin role may enter.
  if (role !== "admin") {
    redirect(ROLE_HOME[role] ?? "/app");
  }
  return <AppShell role="admin">{children}</AppShell>;
}
