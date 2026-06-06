import type { Metadata } from "next";
import { getAllDriverDocuments } from "@/lib/queries";
import { VerificationsManager } from "@/components/admin/verifications-manager";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition } from "@/components/motion";

export const metadata: Metadata = { title: "Verificación de choferes" };
export const dynamic = "force-dynamic";

export default async function VerificationsPage() {
  const groups = await getAllDriverDocuments();
  return (
    <PageTransition>
      <PageHeader title="Verificación de choferes" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
        <VerificationsManager initial={groups} />
      </main>
    </PageTransition>
  );
}
