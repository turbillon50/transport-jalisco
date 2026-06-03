"use client";

import { useState, useTransition } from "react";
import { markNotificationsRead } from "@/app/actions";
import { Icon } from "@/components/icon";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { NotificationRow } from "@/lib/queries";

const toneCls: Record<string, string> = {
  primary: "bg-primary-container text-on-primary-fixed",
  secondary: "bg-secondary-container text-on-secondary-container",
  error: "bg-error text-on-error",
  muted: "bg-surface-variant text-on-surface-variant",
};

export function NotificationsList({ initial }: { initial: NotificationRow[] }) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();

  const nuevas = items.filter((n) => n.unread);
  const anteriores = items.filter((n) => !n.unread);

  function markAll() {
    setItems((xs) => xs.map((n) => ({ ...n, unread: false })));
    startTransition(() => { void markNotificationsRead(); });
  }

  function Row({ n }: { n: NotificationRow }) {
    return (
      <div
        className={cn(
          "border rounded-xl p-md flex gap-md items-start transition-all",
          n.tone === "error"
            ? "bg-error-container border-error"
            : n.unread
              ? "bg-surface-container-lowest border-outline-variant hover:border-primary"
              : "bg-surface-container border-outline-variant opacity-75 hover:opacity-100",
        )}
      >
        <div className={cn("flex-shrink-0 p-sm rounded-lg", toneCls[n.tone] ?? toneCls.muted)}>
          <Icon name={n.icon} fill />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-label-lg font-semibold text-on-surface">{n.title}</h3>
            <span className="text-label-md text-on-surface-variant">{n.time}</span>
          </div>
          <p className="text-body-md text-on-surface-variant mt-xs">{n.body}</p>
        </div>
        {n.unread && <span className="w-2 h-2 rounded-full bg-secondary mt-2" />}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <Icon name="notifications_off" className="text-5xl text-outline" />
        <p className="mt-3 font-semibold">Sin notificaciones por ahora</p>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      <section>
        <div className="flex justify-between items-end mb-sm px-1">
          <h2 className="text-label-lg font-semibold text-outline uppercase tracking-wider">Nuevas</h2>
          {nuevas.length > 0 && (
            <button onClick={markAll} className="text-secondary text-label-md font-semibold hover:underline">
              Marcar todas como leídas
            </button>
          )}
        </div>
        {nuevas.length === 0 ? (
          <p className="text-body-md text-on-surface-variant px-1">Estás al día ✨</p>
        ) : (
          <StaggerContainer className="space-y-sm">
            {nuevas.map((n) => (
              <StaggerItem key={n.id}>
                <Row n={n} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {anteriores.length > 0 && (
        <section>
          <h2 className="text-label-lg font-semibold text-outline uppercase tracking-wider mb-sm px-1">Anteriores</h2>
          <div className="space-y-sm">
            {anteriores.map((n) => (
              <Row key={n.id} n={n} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
