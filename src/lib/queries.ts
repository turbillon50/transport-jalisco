import { db, hasDb } from "@/db";
import {
  featureFlags,
  users as usersTable,
  notifications,
  services,
  vehicles,
  paymentMethods,
  ratings,
} from "@/db/schema";
import { desc, eq, and, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { auth } from "@clerk/nextjs/server";
import { relativeTime } from "@/lib/utils";
import { dbUserIdByClerk } from "@/lib/notify";

async function myId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return dbUserIdByClerk(userId);
  } catch {
    return null;
  }
}

/* ------------------------------ feature flags ----------------------------- */
export async function getFeatureFlags() {
  if (!hasDb) return [];
  try {
    const rows = await db.select().from(featureFlags);
    return rows.map((r) => ({ key: r.key, value: r.value, description: r.description ?? "" }));
  } catch {
    return [];
  }
}

/* --------------------------------- users ---------------------------------- */
export interface AdminUserRow {
  id: string;
  clerkId: string | null;
  name: string;
  email: string;
  role: string;
  joined: string;
}

export async function getUsers(): Promise<AdminUserRow[]> {
  if (!hasDb) return [];
  try {
    const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    return rows
      .filter((r) => !r.deletedAt)
      .map((r) => ({
        id: r.id,
        clerkId: r.clerkId,
        name: r.name,
        email: r.email,
        role: r.role,
        joined: new Date(r.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
      }));
  } catch {
    return [];
  }
}

/* ------------------------------ notifications ----------------------------- */
export interface NotificationRow {
  id: string;
  title: string;
  body: string;
  icon: string;
  time: string;
  tone: "primary" | "secondary" | "error" | "muted";
  unread: boolean;
}

function toneFromIcon(icon: string, unread: boolean): NotificationRow["tone"] {
  if (/warning|error|report/.test(icon)) return "error";
  if (/check_circle|done/.test(icon)) return "muted";
  return unread ? "secondary" : "muted";
}

export async function getNotifications(): Promise<NotificationRow[]> {
  if (!hasDb) return [];
  try {
    const uid = await myId();
    if (!uid) return [];
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, uid))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      icon: r.icon ?? "notifications",
      time: relativeTime(r.createdAt),
      tone: toneFromIcon(r.icon ?? "", !r.read),
      unread: !r.read,
    }));
  } catch {
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  if (!hasDb) return 0;
  try {
    const uid = await myId();
    if (!uid) return 0;
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, uid), eq(notifications.read, false)));
    return rows.length;
  } catch {
    return 0;
  }
}

/* -------------------------------- services -------------------------------- */
export type SvcStatus = "pendiente" | "asignado" | "confirmado" | "en_curso" | "completado" | "cancelado";

export interface ServiceRow {
  id: string;
  day: string;
  month: string;
  time: string;
  origin: string;
  destination: string;
  status: SvcStatus;
  passengers: number;
  driverName: string | null;
  driverAvatar: string | null;
  vehicleModel: string | null;
  plate: string | null;
  passengerName: string | null;
}

function fmtParts(d: Date | null) {
  const date = d ?? new Date();
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase(),
    time: date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

const driverAlias = alias(usersTable, "driver");
const passengerAlias = alias(usersTable, "passenger");

function mapService(r: {
  s: typeof services.$inferSelect;
  driver: { name: string | null; avatarUrl: string | null } | null;
  passenger: { name: string | null } | null;
  vehicle: { model: string | null; plate: string | null } | null;
}): ServiceRow {
  const when = r.s.scheduledAt ?? r.s.createdAt;
  const p = fmtParts(when);
  return {
    id: r.s.id,
    day: p.day,
    month: p.month,
    time: p.time,
    origin: r.s.origin,
    destination: r.s.destination,
    status: r.s.status as SvcStatus,
    passengers: r.s.passengers,
    driverName: r.driver?.name ?? null,
    driverAvatar: r.driver?.avatarUrl ?? null,
    vehicleModel: r.vehicle?.model ?? null,
    plate: r.vehicle?.plate ?? null,
    passengerName: r.passenger?.name ?? null,
  };
}

function baseServiceQuery() {
  return db
    .select({
      s: services,
      driver: { name: driverAlias.name, avatarUrl: driverAlias.avatarUrl },
      passenger: { name: passengerAlias.name },
      vehicle: { model: vehicles.model, plate: vehicles.plate },
    })
    .from(services)
    .leftJoin(driverAlias, eq(services.driverId, driverAlias.id))
    .leftJoin(passengerAlias, eq(services.userId, passengerAlias.id))
    .leftJoin(vehicles, eq(services.vehicleId, vehicles.id));
}

export async function getMyServices(): Promise<ServiceRow[]> {
  if (!hasDb) return [];
  try {
    const uid = await myId();
    if (!uid) return [];
    const rows = await baseServiceQuery().where(eq(services.userId, uid)).orderBy(desc(services.createdAt)).limit(50);
    return rows.map(mapService);
  } catch {
    return [];
  }
}

export async function getActiveService(): Promise<ServiceRow | null> {
  if (!hasDb) return null;
  try {
    const uid = await myId();
    if (!uid) return null;
    const rows = await baseServiceQuery()
      .where(and(eq(services.userId, uid), inArray(services.status, ["asignado", "confirmado", "en_curso"])))
      .orderBy(desc(services.createdAt))
      .limit(1);
    return rows.length ? mapService(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function getServiceById(id: string): Promise<ServiceRow | null> {
  if (!hasDb) return null;
  try {
    const rows = await baseServiceQuery().where(eq(services.id, id)).limit(1);
    return rows.length ? mapService(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function getDriverServices(): Promise<ServiceRow[]> {
  if (!hasDb) return [];
  try {
    const uid = await myId();
    if (!uid) return [];
    const rows = await baseServiceQuery().where(eq(services.driverId, uid)).orderBy(desc(services.createdAt)).limit(50);
    return rows.map(mapService);
  } catch {
    return [];
  }
}

export async function getUnassignedServices(): Promise<ServiceRow[]> {
  if (!hasDb) return [];
  try {
    const rows = await baseServiceQuery().where(eq(services.status, "pendiente")).orderBy(desc(services.createdAt)).limit(50);
    return rows.map(mapService);
  } catch {
    return [];
  }
}

/* --------------------------------- fleet ---------------------------------- */
export async function getVehicles() {
  if (!hasDb) return [];
  try {
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  } catch {
    return [];
  }
}

export async function getDrivers() {
  if (!hasDb) return [];
  try {
    return await db.select().from(usersTable).where(eq(usersTable.role, "driver")).orderBy(desc(usersTable.createdAt));
  } catch {
    return [];
  }
}

/* ------------------------------- dashboards ------------------------------- */
async function count(where: ReturnType<typeof eq>): Promise<number> {
  try {
    const r = await db.select({ n: sql<number>`count(*)::int` }).from(services).where(where);
    return r[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

export async function getOpsStats() {
  if (!hasDb) return { hoy: 0, enCurso: 0, pendientes: 0, choferes: 0 };
  try {
    const [hoy, enCurso, pendientes] = await Promise.all([
      count(inArray(services.status, ["pendiente", "asignado", "confirmado", "en_curso"]) as never),
      count(eq(services.status, "en_curso")),
      count(eq(services.status, "pendiente")),
    ]);
    const drivers = await getDrivers();
    return { hoy, enCurso, pendientes, choferes: drivers.length };
  } catch {
    return { hoy: 0, enCurso: 0, pendientes: 0, choferes: 0 };
  }
}

/* ----------------------------- payment methods ---------------------------- */
export async function getPaymentMethods() {
  if (!hasDb) return [];
  try {
    const uid = await myId();
    if (!uid) return [];
    return await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, uid))
      .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));
  } catch {
    return [];
  }
}

const STATUS_SLICE: { key: SvcStatus; name: string; color: string }[] = [
  { key: "pendiente", name: "Pendiente", color: "#f7bd3d" },
  { key: "asignado", name: "Asignado", color: "#1e6bff" },
  { key: "en_curso", name: "En curso", color: "#00b4d8" },
  { key: "completado", name: "Completado", color: "#16a34a" },
];

export async function getAnalytics() {
  const empty = {
    weekly: [] as { day: string; servicios: number; ingresos: number }[],
    byStatus: [] as { name: string; value: number; color: string }[],
    totals: { servicios: 0, ingresos: 0, completados: 0 },
  };
  if (!hasDb) return empty;
  try {
    const rows = await db
      .select({ status: services.status, price: services.price, createdAt: services.createdAt })
      .from(services);
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const now = new Date();
    const weekly = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return { key: d.toDateString(), day: days[d.getDay()], servicios: 0, ingresos: 0 };
    });
    const byStatus = STATUS_SLICE.map((s) => ({ name: s.name, value: 0, color: s.color }));
    let ingresos = 0;
    let completados = 0;
    for (const r of rows) {
      const k = new Date(r.createdAt).toDateString();
      const w = weekly.find((x) => x.key === k);
      const price = r.price ? Number(r.price) : 0;
      if (w) { w.servicios++; w.ingresos += price; }
      ingresos += price;
      if (r.status === "completado") completados++;
      const slot = STATUS_SLICE.findIndex((s) => s.key === r.status);
      if (slot >= 0) byStatus[slot].value++;
    }
    return {
      weekly: weekly.map(({ day, servicios, ingresos }) => ({ day, servicios, ingresos })),
      byStatus: byStatus.filter((s) => s.value > 0),
      totals: { servicios: rows.length, ingresos, completados },
    };
  } catch {
    return empty;
  }
}

export async function getAuditLog() {
  if (!hasDb) return [];
  try {
    const { auditLog } = await import("@/db/schema");
    const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(8);
    return rows.map((r) => ({ id: r.id, action: r.action, target: r.target ?? "", actor: r.actorName ?? "Sistema", time: relativeTime(r.createdAt) }));
  } catch {
    return [];
  }
}

export async function getMyDbUser() {
  if (!hasDb) return null;
  try {
    const uid = await myId();
    if (!uid) return null;
    const [r] = await db.select().from(usersTable).where(eq(usersTable.id, uid)).limit(1);
    return r ?? null;
  } catch {
    return null;
  }
}

/* -------------------------------- ratings --------------------------------- */
export async function getMyRating(): Promise<{ avg: number | null; count: number }> {
  if (!hasDb) return { avg: null, count: 0 };
  try {
    const uid = await myId();
    if (!uid) return { avg: null, count: 0 };
    const rows = await db.select({ stars: ratings.stars }).from(ratings).where(eq(ratings.rateeId, uid));
    if (!rows.length) return { avg: null, count: 0 };
    const avg = rows.reduce((a, r) => a + r.stars, 0) / rows.length;
    return { avg: Math.round(avg * 10) / 10, count: rows.length };
  } catch {
    return { avg: null, count: 0 };
  }
}
