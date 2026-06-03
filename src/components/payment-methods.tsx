"use client";

import { useState, useTransition } from "react";
import { addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } from "@/app/actions";
import { Icon } from "@/components/icon";
import { Button, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/db/schema";

const TYPES = [
  { id: "tarjeta", label: "Tarjeta", icon: "credit_card" },
  { id: "efectivo", label: "Efectivo", icon: "payments" },
  { id: "transferencia", label: "Transferencia", icon: "account_balance" },
  { id: "empresarial", label: "Empresarial", icon: "business_center" },
] as const;

const iconFor: Record<string, string> = {
  tarjeta: "credit_card",
  efectivo: "payments",
  transferencia: "account_balance",
  empresarial: "business_center",
};

export function PaymentMethods({ methods }: { methods: PaymentMethod[] }) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("tarjeta");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    start(async () => {
      await addPaymentMethod(fd);
      setAdding(false);
      setType("tarjeta");
    });
  }

  return (
    <div className="space-y-3">
      {methods.length === 0 && !adding && (
        <p className="text-body-md text-on-surface-variant">Aún no tienes formas de pago.</p>
      )}

      {methods.map((m) => (
        <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
            <Icon name={iconFor[m.type] ?? "payments"} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-on-surface truncate">{m.label}</p>
            <p className="text-label-md text-on-surface-variant capitalize">{m.type}</p>
          </div>
          {m.isDefault ? (
            <Badge variant="success">Predeterminada</Badge>
          ) : (
            <button onClick={() => start(async () => { await setDefaultPaymentMethod(m.id); })} className="text-label-md text-secondary font-semibold hover:underline">
              Predeterminar
            </button>
          )}
          <button onClick={() => start(async () => { await deletePaymentMethod(m.id); })} aria-label="Eliminar" className="p-2 rounded-full hover:bg-error-container text-on-surface-variant hover:text-error">
            <Icon name="delete" className="text-[20px]" />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={submit} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border text-label-md font-semibold transition-colors",
                  type === t.id ? "border-primary bg-primary-fixed/40 text-primary" : "border-outline-variant text-on-surface-variant",
                )}
              >
                <Icon name={t.icon} fill={type === t.id} /> {t.label}
              </button>
            ))}
          </div>
          {type === "tarjeta" && (
            <div className="grid grid-cols-2 gap-2">
              <Input name="brand" placeholder="Visa / Mastercard" />
              <Input name="last4" placeholder="Últimos 4 dígitos" inputMode="numeric" maxLength={4} />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" loading={pending} icon="check">Guardar</Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" icon="add" onClick={() => setAdding(true)}>Agregar forma de pago</Button>
      )}
    </div>
  );
}
