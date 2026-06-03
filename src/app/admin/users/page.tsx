import type { Metadata } from "next";
import { getUsers } from "@/lib/queries";
import { UsersTable } from "@/components/admin/users-table";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition } from "@/components/motion";

export const metadata: Metadata = { title: "Usuarios" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <PageTransition>
      <PageHeader title="Usuarios" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
        <UsersTable initialUsers={users} />
      </main>
    </PageTransition>
  );
}
