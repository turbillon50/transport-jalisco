import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { invitations } from "@/db/schema";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui";
import { PageTransition } from "@/components/motion";
import { InviteForm } from "@/components/invite-form";

export const dynamic = "force-dynamic";

function Invalid() {
  return (
    <PageTransition className="min-h-[100dvh] grid place-items-center bg-background px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-surface-container grid place-items-center mx-auto mb-4">
          <Icon name="link_off" className="text-3xl text-outline" />
        </div>
        <h1 className="text-headline-sm font-bold text-primary">Invitación no válida</h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          Esta invitación no existe, expiró o ya fue utilizada.
        </p>
        <Link href="/sign-in" className="inline-block mt-6 text-secondary font-semibold hover:underline">
          Ir a iniciar sesión
        </Link>
      </div>
    </PageTransition>
  );
}

export default async function InvitacionPage({ params }: { params: { code: string } }) {
  const code = (params.code ?? "").trim().toUpperCase();
  if (!code || !hasDb) return <Invalid />;

  const [inv] = await db.select().from(invitations).where(eq(invitations.code, code)).limit(1);
  const expired = inv?.expiresAt ? new Date(inv.expiresAt).getTime() < Date.now() : false;
  if (!inv || !inv.active || inv.usedBy || expired) return <Invalid />;

  const role = inv.role as Role;
  const inviterName = inv.createdByName ?? "Tu equipo";

  return (
    <PageTransition className="min-h-[100dvh] grid place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Image
            src="/icons/logo.png"
            alt="MT Empresarial"
            width={160}
            height={52}
            className="w-36 h-auto mx-auto bg-white rounded-2xl p-3 shadow-lg"
          />
          <p className="text-body-md text-on-surface-variant mt-4">Te invitó</p>
          <h1 className="text-headline-md font-bold text-primary">{inviterName}</h1>
          <div className="mt-3 flex justify-center">
            <Badge variant="info">Rol: {ROLE_LABEL[role]}</Badge>
          </div>
          {inv.label && <p className="text-body-sm text-on-surface-variant mt-2">{inv.label}</p>}
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <h2 className="text-title-md font-semibold text-on-surface mb-4">Crea tu cuenta</h2>
          <InviteForm code={code} role={role} inviterName={inviterName} />
        </div>
      </div>
    </PageTransition>
  );
}
