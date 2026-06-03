import type { Metadata } from "next";
import { getUnassignedServices, getDrivers } from "@/lib/queries";
import { AssignmentsBoard } from "@/components/assignments-board";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition } from "@/components/motion";

export const metadata: Metadata = { title: "Asignaciones" };
export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const [services, drivers] = await Promise.all([getUnassignedServices(), getDrivers()]);
  return (
    <PageTransition>
      <PageHeader title="Asignaciones" />
      <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
        <AssignmentsBoard
          services={services.map((s) => ({ id: s.id, time: s.time, day: s.day, month: s.month, origin: s.origin, destination: s.destination, passengers: s.passengers }))}
          drivers={drivers.map((d) => ({ id: d.id, name: d.name }))}
        />
      </main>
    </PageTransition>
  );
}
