import { db, hasDb } from "@/db";
import { services, users } from "@/db/schema";
import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export type HistoryRow = {
  id: string; origin: string; destination: string; status: string;
  price: string | null; scheduledAt: Date | null; createdAt: Date;
  passengers: number | null; requesterName: string | null;
  requesterEmail: string | null; driverId: string | null; driverName: string | null;
};

export type HistoryFilters = { estado?: string; q?: string; desde?: string; hasta?: string };

const ESTADOS = ["pendiente", "asignado", "confirmado", "en_curso", "completado", "cancelado"];

export async function getServicesHistory(f: HistoryFilters): Promise<HistoryRow[]> {
  if (!hasDb) return [];
  const drv = alias(users, "drv");
  const conds = [] as any[];
  if (f.estado && ESTADOS.includes(f.estado)) conds.push(eq(services.status, f.estado as any));
  if (f.q && f.q.trim()) {
    const like = "%" + f.q.trim() + "%";
    conds.push(or(ilike(services.origin, like), ilike(services.destination, like), ilike(users.name, like), ilike(users.email, like)));
  }
  if (f.desde) { const d = new Date(f.desde + "T00:00:00"); if (!isNaN(+d)) conds.push(gte(services.scheduledAt, d)); }
  if (f.hasta) { const h = new Date(f.hasta + "T23:59:59"); if (!isNaN(+h)) conds.push(lte(services.scheduledAt, h)); }
  const rows = await db
    .select({
      id: services.id, origin: services.origin, destination: services.destination,
      status: services.status, price: services.price, scheduledAt: services.scheduledAt,
      createdAt: services.createdAt, passengers: services.passengers,
      requesterName: users.name, requesterEmail: users.email,
      driverId: services.driverId, driverName: drv.name,
    })
    .from(services)
    .leftJoin(users, eq(services.userId, users.id))
    .leftJoin(drv, eq(services.driverId, drv.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(sql`coalesce(${services.scheduledAt}, ${services.createdAt})`))
    .limit(200);
  return rows as HistoryRow[];
}

export async function getStatusCounts(): Promise<Record<string, number>> {
  if (!hasDb) return {};
  const rows = await db
    .select({ status: services.status, n: sql<number>`count(*)::int` })
    .from(services).groupBy(services.status);
  const out: Record<string, number> = {};
  for (const r of rows) out[r.status as string] = r.n;
  return out;
}
