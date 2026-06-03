import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n: number | string | null | undefined) {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

export function relativeTime(d: Date | string): string {
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Justo ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `hace ${days} días`;
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export function formatDateParts(d: Date | string | null | undefined) {
  const date = d ? new Date(d) : new Date();
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase();
  const time = date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { day, month, time };
}
