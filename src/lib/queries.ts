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
import { desc, eq, and, inArray, sql, isNull } from "drizzle-orm";
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
    const rows = await db
      .select({
        id: usersTable.id,
        clerkId: usersTable.clerkId,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(isNull(usersTable.deletedAt))
      .orderBy(desc(usersTable.createdAt));
    return rows.map((r) => ({
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
  userId: string | null;
  driverId: string | null;
  originLat: number | null;
  originLng: number | null;
  destLat: number | null;
  destLng: number | null;
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
    userId: r.s.userId,
    driverId: r.s.driverId,
    originLat: r.s.originLat,
    originLng: r.s.originLng,
    destLat: r.s.destLat,
    destLng: r.s.destLng,
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
    return await db
      .select({
        id: usersTable.id,
        clerkId: usersTable.clerkId,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        avatarUrl: usersTable.avatarUrl,
        rating: usersTable.rating,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(and(eq(usersTable.role, "driver"), isNull(usersTable.deletedAt)))
      .orderBy(desc(usersTable.createdAt));
  } catch {
    return [];
  }
}

export interface AdminDriverRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  rating: number | null;
  blocked: boolean;
  vehiclePlate: string | null;
  vehicleModel: string | null;
}

/** Choferes para el panel admin: incluye bloqueados (deletedAt != null) y su vehículo. */
export async function getDriversAdmin(): Promise<AdminDriverRow[]> {
  if (!hasDb) return [];
  try {
    const rows = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        rating: usersTable.rating,
        deletedAt: usersTable.deletedAt,
        vehiclePlate: vehicles.plate,
        vehicleModel: vehicles.model,
      })
      .from(usersTable)
      .leftJoin(vehicles, eq(vehicles.driverId, usersTable.id))
      .where(eq(usersTable.role, "driver"))
      .orderBy(desc(usersTable.createdAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      rating: r.rating != null ? Number(r.rating) : null,
      blocked: r.deletedAt != null,
      vehiclePlate: r.vehiclePlate ?? null,
      vehicleModel: r.vehicleModel ?? null,
    }));
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
  // Cada conteo es independiente: si uno falla, los demas siguen reales.
  const safe = async (q: Promise<number>) => { try { return await q; } catch { return 0; } };
  const [hoy, enCurso, pendientes, choferes] = await Promise.all([
    safe(count(inArray(services.status, ["pendiente", "asignado", "confirmado", "en_curso"]) as never)),
    safe(count(eq(services.status, "en_curso"))),
    safe(count(eq(services.status, "pendiente"))),
    (async () => { try { return (await getDrivers()).length; } catch { return 0; } })(),
  ]);
  return { hoy, enCurso, pendientes, choferes };
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
  { key: "pendiente", name: "Pendiente", color: "#00b4d8" },
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

/* ----------------------------- driver map (geo) ---------------------------- */
export interface DriverMapData {
  id: string;
  origin: string;
  destination: string;
  time: string;
  passengers: number;
  originLat: number | null;
  originLng: number | null;
  destLat: number | null;
  destLng: number | null;
}

/** Servicio activo del chofer con coordenadas reales para el mapa GPS. */
export async function getDriverActiveGeo(): Promise<DriverMapData | null> {
  if (!hasDb) return null;
  try {
    const uid = await myId();
    if (!uid) return null;
    const rows = await db
      .select()
      .from(services)
      .where(and(eq(services.driverId, uid), inArray(services.status, ["asignado", "confirmado", "en_curso"])))
      .orderBy(desc(services.createdAt))
      .limit(1);
    if (!rows.length) return null;
    const s = rows[0];
    const when = s.scheduledAt ?? s.createdAt;
    return {
      id: s.id,
      origin: s.origin,
      destination: s.destination,
      time: fmtParts(when).time,
      passengers: s.passengers,
      originLat: s.originLat,
      originLng: s.originLng,
      destLat: s.destLat,
      destLng: s.destLng,
    };
  } catch {
    return null;
  }
}

/* ------------------------------- mensajería ------------------------------- */
export interface MessageRow {
  id: string;
  body: string;
  fromRole: "user" | "driver" | "ops" | "admin";
  fromName: string;
  mine: boolean;
  time: string;
}

/** Hilo de mensajes de un servicio (orden cronológico). `mine` marca los míos. */
export async function getServiceMessages(serviceId: string): Promise<MessageRow[]> {
  if (!hasDb) return [];
  try {
    const { messages } = await import("@/db/schema");
    const uid = await myId();
    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.serviceId, serviceId))
      .orderBy(messages.createdAt)
      .limit(200);
    return rows.map((r) => ({
      id: r.id,
      body: r.body,
      fromRole: r.fromRole as MessageRow["fromRole"],
      fromName: r.fromName ?? "—",
      mine: !!uid && r.fromUser === uid,
      time: new Date(r.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true }),
    }));
  } catch {
    return [];
  }
}

/* ------------------------------ flota (mapa) ------------------------------ */
export interface FleetUnit {
  serviceId: string;
  lat: number;
  lng: number;
  driverName: string | null;
  plate: string | null;
  origin: string;
  destination: string;
  status: SvcStatus;
}

/**
 * Posiciones para el mapa de flota (ops/admin): servicios activos con su última
 * posición conocida (location_update) o, en su defecto, el origen del traslado.
 */
export async function getFleetPositions(): Promise<FleetUnit[]> {
  if (!hasDb) return [];
  try {
    const { serviceEvents } = await import("@/db/schema");
    const rows = await baseServiceQuery()
      .where(inArray(services.status, ["asignado", "confirmado", "en_curso"]))
      .orderBy(desc(services.createdAt))
      .limit(100);
    const units: FleetUnit[] = [];
    for (const r of rows) {
      let lat = r.s.originLat;
      let lng = r.s.originLng;
      try {
        const [ev] = await db
          .select({ lat: serviceEvents.locationLat, lng: serviceEvents.locationLng })
          .from(serviceEvents)
          .where(and(eq(serviceEvents.serviceId, r.s.id), eq(serviceEvents.type, "location_update")))
          .orderBy(desc(serviceEvents.timestamp))
          .limit(1);
        if (ev?.lat != null && ev?.lng != null) { lat = ev.lat; lng = ev.lng; }
      } catch { /* sin evento de ubicación */ }
      if (lat == null || lng == null) continue;
      units.push({
        serviceId: r.s.id,
        lat,
        lng,
        driverName: r.driver?.name ?? null,
        plate: r.vehicle?.plate ?? null,
        origin: r.s.origin,
        destination: r.s.destination,
        status: r.s.status as SvcStatus,
      });
    }
    return units;
  } catch {
    return [];
  }
}

/** Última posición conocida del chofer de un servicio (para el mapa del usuario). */
export async function getServiceDriverLocation(serviceId: string): Promise<{ lat: number; lng: number; time: string } | null> {
  if (!hasDb) return null;
  try {
    const { serviceEvents } = await import("@/db/schema");
    const [ev] = await db
      .select({ lat: serviceEvents.locationLat, lng: serviceEvents.locationLng, ts: serviceEvents.timestamp })
      .from(serviceEvents)
      .where(and(eq(serviceEvents.serviceId, serviceId), eq(serviceEvents.type, "location_update")))
      .orderBy(desc(serviceEvents.timestamp))
      .limit(1);
    if (ev?.lat == null || ev?.lng == null) return null;
    return { lat: ev.lat, lng: ev.lng, time: relativeTime(ev.ts) };
  } catch {
    return null;
  }
}

/* --------------------------- documentos del chofer ------------------------- */
export type DocKind = "foto_chofer" | "foto_unidad" | "licencia" | "tarjeta_circulacion" | "otro";
export type DocStatus = "pendiente" | "aprobado" | "rechazado";

export interface DriverDocRow {
  id: string;
  kind: DocKind;
  url: string;
  fileName: string | null;
  status: DocStatus;
  note: string | null;
  isPdf: boolean;
  time: string;
}

function mapDoc(r: { id: string; kind: string; url: string; fileName: string | null; status: string; note: string | null; createdAt: Date }): DriverDocRow {
  return {
    id: r.id,
    kind: r.kind as DocKind,
    url: r.url,
    fileName: r.fileName,
    status: r.status as DocStatus,
    note: r.note,
    isPdf: /\.pdf($|\?)/i.test(r.url) || (r.fileName ?? "").toLowerCase().endsWith(".pdf"),
    time: relativeTime(r.createdAt),
  };
}

/** Documentos del chofer actual (el más reciente por tipo). */
export async function getMyDriverDocuments(): Promise<DriverDocRow[]> {
  if (!hasDb) return [];
  try {
    const { driverDocuments } = await import("@/db/schema");
    const uid = await myId();
    if (!uid) return [];
    const rows = await db
      .select()
      .from(driverDocuments)
      .where(eq(driverDocuments.driverId, uid))
      .orderBy(desc(driverDocuments.createdAt))
      .limit(100);
    const latest = new Map<string, DriverDocRow>();
    for (const r of rows) if (!latest.has(r.kind)) latest.set(r.kind, mapDoc(r));
    return [...latest.values()];
  } catch {
    return [];
  }
}

export interface DriverDocsGroup {
  driverId: string;
  name: string;
  email: string;
  vehiclePlate: string | null;
  docs: DriverDocRow[];
  pending: number;
}

/** Todos los documentos agrupados por chofer (panel admin de verificación). */
export async function getAllDriverDocuments(): Promise<DriverDocsGroup[]> {
  if (!hasDb) return [];
  try {
    const { driverDocuments } = await import("@/db/schema");
    const rows = await db
      .select({
        id: driverDocuments.id,
        kind: driverDocuments.kind,
        url: driverDocuments.url,
        fileName: driverDocuments.fileName,
        status: driverDocuments.status,
        note: driverDocuments.note,
        createdAt: driverDocuments.createdAt,
        driverId: driverDocuments.driverId,
        name: usersTable.name,
        email: usersTable.email,
        plate: vehicles.plate,
      })
      .from(driverDocuments)
      .leftJoin(usersTable, eq(driverDocuments.driverId, usersTable.id))
      .leftJoin(vehicles, eq(vehicles.driverId, usersTable.id))
      .orderBy(desc(driverDocuments.createdAt))
      .limit(500);
    const groups = new Map<string, DriverDocsGroup>();
    const seen = new Set<string>(); // driverId+kind → solo el más reciente
    for (const r of rows) {
      let g = groups.get(r.driverId);
      if (!g) {
        g = { driverId: r.driverId, name: r.name ?? "—", email: r.email ?? "", vehiclePlate: r.plate ?? null, docs: [], pending: 0 };
        groups.set(r.driverId, g);
      }
      const key = `${r.driverId}:${r.kind}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const d = mapDoc(r);
      g.docs.push(d);
      if (d.status === "pendiente") g.pending++;
    }
    return [...groups.values()].sort((a, b) => b.pending - a.pending);
  } catch {
    return [];
  }
}
