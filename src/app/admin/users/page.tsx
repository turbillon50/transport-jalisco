"use client";

import { useState, useTransition } from "react";
import { adminUsers } from "@/lib/mock";
import { updateUserRole } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Input, Badge, Alert } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Role } from "@/lib/roles";

const ROLES: Role[] = ["user", "driver", "ops", "admin"];
const roleTone: Record<string, "neutral" | "secondary" | "primary" | "warning"> = {
  user: "neutral", driver: "secondary", ops: "primary", admin: "warning",
};

export default function UsersPage() {
  const [rows, setRows] = useState(adminUsers);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(query.toLowerCase()));

  function changeRole(id: string, role: Role) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, role } : r)));
    startTransition(async () => {
      const res = await updateUserRole(id, role);
      setToast(res.message);
    });
  }

  return (
    <PageTransition>
      <PageHeader title="Usuarios" />
      <main className="px-margin-mobile md:px-margin-desktop py-lg max-w-[1440px] mx-auto space-y-lg">
        {toast && <Alert tone="success">{toast}</Alert>}
        <div className="max-w-sm"><Input icon="search" placeholder="Buscar usuario…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr] gap-4 px-lg py-3 bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider">
            <span>Usuario</span><span>Email</span><span>Rol</span><span>Alta</span>
          </div>
          <StaggerContainer>
            {filtered.map((u) => (
              <StaggerItem key={u.id}>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1.5fr_1fr] gap-2 md:gap-4 items-center px-lg py-4 border-t border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center"><Icon name="person" fill className="text-[20px]" /></div>
                    <span className="font-semibold text-on-surface">{u.name}</span>
                  </div>
                  <span className="text-body-md text-on-surface-variant truncate">{u.email}</span>
                  <div className="flex items-center gap-2">
                    <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                    <div className="relative">
                      <select
                        aria-label={`Rol de ${u.name}`}
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value as Role)}
                        className="appearance-none bg-surface-container border border-outline-variant rounded-lg pl-3 pr-8 py-1.5 text-label-md text-on-surface outline-none focus:border-secondary cursor-pointer"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <Icon name="expand_more" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none" />
                    </div>
                  </div>
                  <span className="text-label-md text-on-surface-variant">{u.joined}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </main>
    </PageTransition>
  );
}
