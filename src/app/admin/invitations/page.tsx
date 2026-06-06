import type { Metadata } from "next";
import { CAN_INVITE } from "@/lib/roles";
import { getMyInvitations } from "@/app/actions";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition } from "@/components/motion";
import { InviteCenter } from "@/components/invite-center";

export const metadata: Metadata = { title: "Invitaciones" };
export const dynamic = "force-dynamic";

export default async function AdminInvitationsPage() {
  // Vive bajo el layout /admin que valida cookie de llave-enlace O rol admin de
  // Clerk, así que el admin por cookie (sin sesión Clerk) SÍ entra aquí.
  const allowedRoles = CAN_INVITE["admin"];
  const invites = await getMyInvitations();

  return (
    <PageTransition>
      <PageHeader title="Invitaciones" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
        <InviteCenter allowedRoles={allowedRoles} myRole="admin" initialInvites={invites} />
      </main>
    </PageTransition>
  );
}
