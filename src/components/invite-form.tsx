"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Alert } from "@/components/ui";
import { registerWithInvite } from "@/app/actions";
import type { Role } from "@/lib/roles";

export function InviteForm({ code, role }: { code: string; role: Role; inviterName?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!accept) return setError("Debes aceptar los Términos y la Privacidad.");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    setLoading(true);
    const res = await registerWithInvite({ code, name, email, password, phone, acceptTerms: accept });
    if (res.ok && res.ticketUrl) {
      window.location.href = res.ticketUrl;
      return;
    }
    setLoading(false);
    setError(res.message || "No se pudo crear la cuenta.");
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      <Input label="Nombre completo" icon="person" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
      <Input label="Correo" type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required />
      <Input label="Contraseña" type="password" icon="lock" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} required />
      <Input label="Teléfono (opcional)" type="tel" icon="call" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="33 1234 5678" />
      <label className="flex items-start gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
        <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 accent-[var(--color-primary)]" />
        <span>Acepto los Términos y la Política de Privacidad de MT Empresarial.</span>
      </label>
      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon="how_to_reg">
        Crear mi cuenta
      </Button>
    </motion.form>
  );
}
