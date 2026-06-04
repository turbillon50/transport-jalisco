import { NextResponse, type NextRequest } from "next/server";
import { isNotNull, sql } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { vehicles, users, services } from "@/db/schema";
import { ADMIN_KEY_HASH, hashToken } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Siembra DEMO opcional (protegida por la llave del panel): /api/seed?key=<TOKEN>.
 * Inserta unidades, un chofer demo y un par de traslados para poder ver las
 * vistas con contenido. Idempotente.
 */
export async function GET(req: NextRequest) {
  if (hashToken(req.nextUrl.searchParams.get("key") ?? "") !== ADMIN_KEY_HASH) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!hasDb) return NextResponse.json({ error: "sin DB" }, { status: 500 });

  const result: Record<string, unknown> = {};
  try {
    // Vehículos
    await db
      .insert(vehicles)
      .values([
        { plate: "JAL-12-AB", model: "Toyota Hiace 2023", capacity: 14, status: "operativo", odometer: 12450 },
        { plate: "GTO-45-XY", model: "Mercedes Sprinter", capacity: 18, status: "mantenimiento", odometer: 38900 },
        { plate: "JAL-88-ZZ", model: "Nissan Urvan", capacity: 14, status: "operativo", odometer: 9120 },
      ])
      .onConflictDoNothing({ target: vehicles.plate });

    // Chofer demo
    await db
      .insert(users)
      .values({ name: "Chofer Demo", email: "chofer.demo@mtempresarial.life", role: "driver", rating: "4.8" })
      .onConflictDoNothing();

    // Traslados: solo si no hay ninguno (evita duplicar en re-ejecuciones)
    const existing = await db.select({ n: sql<number>`count(*)::int` }).from(services);
    if ((existing[0]?.n ?? 0) === 0) {
      await db.insert(services).values([
        { origin: "Aeropuerto GDL", destination: "Hotel Riu Plaza", passengers: 1, status: "pendiente" },
        { origin: "Hotel Hilton", destination: "Centro Expo GDL", passengers: 2, status: "pendiente" },
      ]);

      // Asigna un traslado al primer usuario real (con Clerk) como chofer,
      // para que pueda probar los controles en /driver.
      const [realUser] = await db.select({ id: users.id }).from(users).where(isNotNull(users.clerkId)).limit(1);
      if (realUser) {
        await db.insert(services).values({
          origin: "Domicilio Particular",
          destination: "Aeropuerto GDL",
          passengers: 1,
          status: "asignado",
          driverId: realUser.id,
        });
        result.assignedToCurrentUser = true;
      }
    } else {
      result.servicesSkipped = "ya existían";
    }

    const counts = await db.execute(
      sql.raw("SELECT (SELECT count(*) FROM vehicles) AS vehicles, (SELECT count(*) FROM services) AS services, (SELECT count(*) FROM users WHERE role='driver') AS drivers"),
    );
    result.counts = (counts as { rows?: unknown[] }).rows ?? counts;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error)?.message ?? e) }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...result });
}
