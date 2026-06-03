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

export function formatDateParts(d: Date | string | null | undefined) {
  const date = d ? new Date(d) : new Date();
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase();
  const time = date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { day, month, time };
}
