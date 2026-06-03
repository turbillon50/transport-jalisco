"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { VAPID_PUBLIC_KEY } from "@/lib/vapid-public";
import { cn } from "@/lib/utils";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "idle" | "unsupported" | "subscribing" | "on" | "denied" | "error";

export function PushToggle({ className }: { className?: string }) {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") setState("denied");
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (sub) setState("on"); })
      .catch(() => {});
  }, []);

  async function enable() {
    try {
      setState("subscribing");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState("denied"); return; }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setState(res.ok ? "on" : "error");
    } catch (e) {
      console.error("[push-toggle]", e);
      setState("error");
    }
  }

  if (state === "unsupported") return null;

  const label =
    state === "on" ? "Notificaciones activas"
    : state === "subscribing" ? "Activando…"
    : state === "denied" ? "Permiso bloqueado"
    : state === "error" ? "Reintentar"
    : "Activar notificaciones";

  return (
    <button
      onClick={state === "on" || state === "subscribing" ? undefined : enable}
      disabled={state === "subscribing"}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-label-md font-semibold border transition-colors",
        state === "on"
          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
          : "bg-surface-container border-outline-variant text-primary hover:bg-primary-fixed",
        className,
      )}
    >
      <Icon name={state === "on" ? "notifications_active" : "notifications"} fill={state === "on"} className="text-[18px]" />
      {label}
    </button>
  );
}
