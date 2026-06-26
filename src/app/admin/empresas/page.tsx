import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { Icon } from "@/components/icon";
import { db, hasDb } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = { title: "Empresas" };
export const dynamic = "force-dynamic";

async function getEmpresas() {
  if (!hasDb) return [];
  try { return await db.select().from(users).where(eq(users.role, "user")).orderBy(desc(users.createdAt)).limit(50); }
  catch { return []; }
}

export default async function EmpresasPage() {
  const empresas = await getEmpresas();
  return (
    <PageTransition>
      <PageHeader title="Empresas" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {empresas.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-on-surface-variant">
              <Icon name="domain" className="text-[48px] mb-3 opacity-40" />
              <p className="text-title-md">Sin empresas registradas</p>
            </div>
          ) : empresas.map((e) => (
            <StaggerItem key={e.id}>
              <HoverCard lift={-3} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                    <Icon name="domain" className="text-primary text-[20px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-lg font-semibold text-on-surface truncate">{e.name}</p>
                    <p className="text-label-sm text-on-surface-variant truncate">{e.email}</p>
                  </div>
                </div>
                <p className="text-label-sm text-on-surface-variant">
                  Registrado: {new Date(e.createdAt).toLocaleDateString("es-MX")}
                </p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </main>
    </PageTransition>
  );
}
