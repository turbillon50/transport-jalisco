import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition } from "@/components/motion";
import { AdminMapClient } from "@/components/admin/admin-map-client";

export const metadata: Metadata = { title: "Mapa en vivo" };
export const dynamic = "force-dynamic";

export default function AdminMapPage() {
  return (
    <PageTransition>
      <PageHeader title="Mapa en vivo" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
        <div className="rounded-2xl overflow-hidden border border-outline-variant" style={{ height: "70vh" }}>
          <AdminMapClient />
        </div>
      </main>
    </PageTransition>
  );
}
