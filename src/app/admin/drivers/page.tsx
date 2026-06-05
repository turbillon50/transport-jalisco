import type { Metadata } from "next";
import { getDriversAdmin } from "@/lib/queries";
import { DriversManager } from "@/components/admin/drivers-manager";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition } from "@/components/motion";

export const metadata: Metadata = { title: "Choferes" };
export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const drivers = await getDriversAdmin();
  return (
    <PageTransition>
      <PageHeader title="Choferes" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
        <DriversManager initialDrivers={drivers} />
      </main>
    </PageTransition>
  );
}
