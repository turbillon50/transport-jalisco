import { redirect } from "next/navigation";
import { ForgeShell } from "@/components/admin/forge-shell";
import { getRole } from "@/lib/auth";
import { hasAdminCookie } from "@/lib/admin-gate";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Acceso por llave-enlace (cookie) o por rol admin de Clerk.
  if (!hasAdminCookie()) {
    const role = await getRole();
    if (role !== "admin") redirect("/");
  }
  return <ForgeShell role="Administrador">{children}</ForgeShell>;
}
