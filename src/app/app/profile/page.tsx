import type { Metadata } from "next";
import { getProfile } from "@/lib/auth";
import { getMyDbUser, getPaymentMethods, getMyRating } from "@/lib/queries";
import { AvatarUpload } from "@/components/avatar-upload";
import { PaymentMethods } from "@/components/payment-methods";
import { Stars } from "@/components/ui-bits";
import { Card } from "@/components/ui";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, FadeInOnScroll } from "@/components/motion";

export const metadata: Metadata = { title: "Mi perfil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [profile, dbUser, methods, rating] = await Promise.all([
    getProfile(),
    getMyDbUser(),
    getPaymentMethods(),
    getMyRating(),
  ]);

  const avatar = dbUser?.avatarUrl ?? profile.avatar ?? null;
  const name = dbUser?.name ?? profile.name;
  const email = dbUser?.email ?? profile.email;

  return (
    <PageTransition>
      <PageHeader title="Mi perfil" />
      <main className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-lg">
        <FadeInOnScroll>
          <Card className="p-lg flex flex-col items-center text-center gap-2">
            <AvatarUpload initialUrl={avatar} name={name} />
            <h2 className="text-headline-sm font-semibold text-on-surface mt-2">{name}</h2>
            {email && <p className="text-body-md text-on-surface-variant">{email}</p>}
            <div className="flex items-center gap-2 mt-1">
              <Stars value={rating.avg} />
              <span className="text-label-md text-on-surface-variant">
                {rating.avg ? `${rating.avg} · ${rating.count} calificaciones` : "Sin calificaciones aún"}
              </span>
            </div>
          </Card>
        </FadeInOnScroll>

        <FadeInOnScroll delay={0.05}>
          <Card className="p-lg">
            <h3 className="text-headline-sm font-semibold text-on-surface mb-1 flex items-center gap-2">
              <Icon name="credit_card" className="text-primary" /> Formas de pago
            </h3>
            <p className="text-body-md text-on-surface-variant mb-4">Administra cómo pagas tus traslados.</p>
            <PaymentMethods methods={methods} />
          </Card>
        </FadeInOnScroll>
      </main>
    </PageTransition>
  );
}
