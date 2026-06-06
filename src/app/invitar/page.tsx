import type { Metadata } from "next";
import { getRole } from "@/lib/auth";
import { CAN_INVITE } from "@/lib/roles";
import { getMyInvitations } from "@/app/actions";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition } from "@/components/motion";
import { InviteCenter } from "@/components/invite-center";

export const metadata: Metadata = { title: "Invitaciones" };
export const dynamic = "force-dynamic";

export default async function InvitarPage() {
  const role = await getRole();
  const allowed = CAN_INVITE[role];
  const initialInvites = await getMyInvitations();

  return (
    <PageTransition>
      <PageHeader title="Invitar a tu equipo" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1100px] mx-auto">
        <InviteCenter allowedRoles={allowed} myRole={role} initialInvites={initialInvites} />
      </main>
    </PageTransition>
  );
}
