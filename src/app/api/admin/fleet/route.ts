import { NextResponse } from "next/server";
import { db, hasDb } from "@/db";
import { services, serviceEvents, users } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getRole } from "@/lib/auth";
import { hasAdminCookie } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Flota en vivo para el mapa admin: por cada servicio activo (asignado/
 * confirmado/en_curso) devuelve su última posición reportada por el chofer
 * (service_events.location_update), el nombre del chofer y origen/destino.
 */
export async function GET() {
  const authorized = hasAdminCookie() || ["admin", "ops"].includes(await getRole());
  if (!authorized) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return NextResponse.json({ units: [] });

  try {
    const active = await db
      .select({
        id: services.id,
        status: services.status,
        origin: services.origin,
        destination: services.destination,
        driverId: services.driverId,
        driverName: users.name,
      })
      .from(services)
      .leftJoin(users, eq(services.driverId, users.id))
      .where(inArray(services.status, ["asignado", "confirmado", "en_curso"]));

    const units = [] as {
      serviceId: string; status: string; origin: string; destination: string;
      driver: string; lat: number; lng: number; at: string;
    }[];

    for (const s of active) {
      const [last] = await db
        .select({ lat: serviceEvents.locationLat, lng: serviceEvents.locationLng, at: serviceEvents.timestamp })
        .from(serviceEvents)
        .where(and(eq(serviceEvents.serviceId, s.id), eq(serviceEvents.type, "location_update")))
        .orderBy(desc(serviceEvents.timestamp))
        .limit(1);
      if (last?.lat != null && last?.lng != null) {
        units.push({
          serviceId: s.id, status: s.status, origin: s.origin, destination: s.destination,
          driver: s.driverName ?? "Chofer", lat: last.lat, lng: last.lng, at: last.at.toISOString(),
        });
      }
    }
    return NextResponse.json({ units, count: units.length, activeServices: active.length });
  } catch (e) {
    console.error("[fleet]", e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
