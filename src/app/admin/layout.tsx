import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getRole } from "@/lib/auth";
import { hasAdminCookie } from "@/lib/admin-gate";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Acceso por llave-enlace (cookie) o por rol admin de Clerk.
  if (!hasAdminCookie()) {
    const role = await getRole();
    if (role !== "admin") redirect("/");
  }
  return <AppShell role="admin">{children}</AppShell>;
}
