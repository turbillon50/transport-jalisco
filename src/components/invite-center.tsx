"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input, Badge, Alert, type BadgeVariant } from "@/components/ui";
import { EmptyState } from "@/components/ui-bits";
import { Icon } from "@/components/icon";
import { createInvitation, revokeInvitation, type InvitationRow } from "@/app/actions";
import { ROLE_LABEL, type Role } from "@/lib/roles";

const statusVariant: Record<InvitationRow["status"], BadgeVariant> = {
  Activa: "success",
  Usada: "info",
  Revocada: "danger",
  Expirada: "warning",
};

export function InviteCenter({
  allowedRoles,
  myRole,
  initialInvites,
}: {
  allowedRoles: Role[];
  myRole: Role;
  initialInvites: InvitationRow[];
}) {
  const [invites, setInvites] = useState<InvitationRow[]>(initialInvites);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(allowedRoles[0] ?? "user");
  const [label, setLabel] = useState("");
  const [email, setEmail] = useState("");
  const [days, setDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ code: string; url: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, tag: string) {
    navigator.clipboard?.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(null), 1800);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await createInvitation(role, {
      label: label || undefined,
      email: email || undefined,
      expiresInDays: days ? Number(days) : undefined,
    });
    setLoading(false);
    if (res.ok && res.code && res.url) {
      setCreated({ code: res.code, url: res.url });
      setInvites((prev) => [
        {
          id: crypto.randomUUID(),
          code: res.code!,
          role,
          label: label || null,
          status: "Activa",
          usedByName: null,
          createdAt: new Date().toISOString(),
          url: res.url!,
        },
        ...prev,
      ]);
      setLabel("");
      setEmail("");
      setDays("");
    } else {
      setError(res.message);
    }
  }

  async function onRevoke(id: string) {
    const res = await revokeInvitation(id);
    if (res.ok) {
      setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Revocada" } : i)));
    } else {
      setError(res.message);
    }
  }

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-title-lg font-semibold text-on-surface">Invitar a tu equipo</h2>
          <p className="text-body-sm text-on-surface-variant">
            Genera enlaces de invitación con el rol que tú puedes otorgar.
          </p>
        </div>
        <Button variant="primary" icon="person_add" onClick={() => { setOpen((o) => !o); setCreated(null); }}>
          {open ? "Cerrar" : "Invitar"}
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={onCreate}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Rol de la invitación</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {allowedRoles.map((r) => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
              </div>
              <Input label="Etiqueta (opcional)" icon="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej. Chofer turno noche" />
              <Input label="Enviar por correo (opcional)" type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="invitado@correo.com" />
              <Input label="Expira en (días, opcional)" type="number" icon="schedule" value={days} onChange={(e) => setDays(e.target.value)} placeholder="Ej. 7" min={1} />
              <Button type="submit" variant="primary" fullWidth loading={loading} icon="auto_awesome">
                Generar invitación
              </Button>

              {created && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 space-y-3">
                  <p className="text-body-sm text-on-surface-variant">Invitación lista. Comparte el enlace:</p>
                  <div className="flex items-center gap-2 text-sm font-mono break-all text-primary">
                    <Icon name="link" className="text-[18px] shrink-0" />
                    {created.url}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" icon="content_copy" onClick={() => copy(created.url, "url")}>
                      {copied === "url" ? "¡Copiado!" : "Copiar enlace"}
                    </Button>
                    <Button size="sm" variant="ghost" icon="tag" onClick={() => copy(created.code, "code")}>
                      {copied === "code" ? "¡Copiado!" : "Copiar código"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h3 className="text-title-md font-semibold text-on-surface mb-3">Mis invitaciones</h3>
        {invites.length === 0 ? (
          <EmptyState icon="mail" title="Sin invitaciones aún" body="Genera tu primera invitación para sumar gente a tu equipo." />
        ) : (
          <div className="space-y-3">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-on-surface">{inv.code}</span>
                    <Badge variant="info">{ROLE_LABEL[inv.role]}</Badge>
                    <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    {inv.label ? `${inv.label} · ` : ""}
                    {inv.usedByName ? `Usada por ${inv.usedByName} · ` : ""}
                    {new Date(inv.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="secondary" icon="content_copy" onClick={() => copy(inv.url, inv.id)}>
                    {copied === inv.id ? "¡Copiado!" : "Copiar enlace"}
                  </Button>
                  {(inv.status === "Activa") && (
                    <Button size="sm" variant="danger" icon="block" onClick={() => onRevoke(inv.id)}>
                      Revocar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
