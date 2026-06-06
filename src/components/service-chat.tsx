"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/actions";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { MessageRow } from "@/lib/queries";

const ROLE_META: Record<MessageRow["fromRole"], { label: string; cls: string }> = {
  user: { label: "Pasajero", cls: "bg-primary-fixed text-primary" },
  driver: { label: "Chofer", cls: "bg-secondary-container text-on-secondary" },
  ops: { label: "Despacho", cls: "bg-surface-container-high text-on-surface" },
  admin: { label: "Admin", cls: "bg-surface-container-high text-on-surface" },
};

export function ServiceChat({ serviceId, initial }: { serviceId: string; initial: MessageRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Mensajes optimistas locales; se limpian cuando el servidor refresca `initial`.
  const [optimistic, setOptimistic] = useState<MessageRow[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOptimistic([]);
  }, [initial]);

  const all = [...initial, ...optimistic];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [all.length]);

  // Refresco suave para acercarnos a tiempo real.
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 12000);
    return () => clearInterval(t);
  }, [router]);

  function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const body = value.trim();
    if (!body || pending) return;
    setError(null);
    setValue("");
    setOptimistic((o) => [...o, { id: `tmp-${Date.now()}`, body, fromRole: "user", fromName: "Tú", mine: true, time: "ahora" }]);
    start(async () => {
      const res = await sendMessage(serviceId, body);
      if (!res.ok) {
        setError(res.message);
        setValue(body);
      }
      router.refresh();
    });
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-lg py-md border-b border-outline-variant">
        <Icon name="forum" fill className="text-primary" />
        <h3 className="text-label-lg font-semibold text-on-surface">Mensajes del traslado</h3>
      </div>

      <div className="flex flex-col gap-3 p-lg max-h-[42dvh] overflow-y-auto">
        {all.length === 0 ? (
          <p className="text-center text-on-surface-variant text-body-md py-6">
            Sin mensajes todavía. Escribe para coordinar el viaje.
          </p>
        ) : (
          all.map((m) => {
            const meta = ROLE_META[m.fromRole];
            return (
              <div key={m.id} className={cn("flex flex-col max-w-[82%]", m.mine ? "self-end items-end" : "self-start items-start")}>
                {!m.mine && (
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1", meta.cls)}>
                    {m.fromName} · {meta.label}
                  </span>
                )}
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-body-md leading-snug whitespace-pre-wrap break-words",
                    m.mine ? "bg-primary text-on-primary rounded-br-sm" : "bg-surface-container-high text-on-surface rounded-bl-sm",
                  )}
                >
                  {m.body}
                </div>
                <span className="text-[10px] text-outline mt-1 px-1">{m.time}</span>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 p-3 border-t border-outline-variant bg-surface-container-lowest">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) submit(e);
          }}
          rows={1}
          maxLength={1000}
          placeholder="Escribe un mensaje…"
          className="flex-1 resize-none max-h-28 rounded-xl bg-surface-container-high border border-outline-variant px-4 py-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          aria-label="Enviar mensaje"
          className="shrink-0 w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
        >
          <Icon name={pending ? "hourglass_top" : "send"} fill />
        </button>
      </form>
      {error && <p className="px-4 pb-3 text-error text-label-md">{error}</p>}
    </div>
  );
}
