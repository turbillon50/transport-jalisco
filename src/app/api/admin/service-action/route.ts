import { NextResponse } from "next/server";
import { db, hasDb } from "@/db";
import { services, serviceEvents, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getRole } from "@/lib/auth";
import { hasAdminCookie } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CANCELABLES = ["pendiente", "asignado", "confirmado", "en_curso"];

export async function POST(req: Request) {
  const authorized = hasAdminCookie() || ["admin", "ops"].includes(await getRole());
  if (!authorized) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: "Sin base de datos" }, { status: 503 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const { serviceId, action, driverId } = body ?? {};
  if (!serviceId || !["cancel", "assign", "reassign"].includes(action))
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });

  const [svc] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
  if (!svc) return NextResponse.json({ error: "Traslado no encontrado" }, { status: 404 });

  try {
    if (action === "cancel") {
      if (!CANCELABLES.includes(svc.status as string))
        return NextResponse.json({ error: `No se puede cancelar un traslado ${svc.status}` }, { status: 409 });
      await db.update(services).set({ status: "cancelado" }).where(eq(services.id, serviceId));
      await db.insert(serviceEvents).values({ serviceId, type: "cancelled" as any, note: "Cancelado desde panel admin" });
      return NextResponse.json({ ok: true, status: "cancelado" });
    }
    // assign / reassign
    if (!driverId) return NextResponse.json({ error: "Falta chofer" }, { status: 400 });
    const [drv] = await db.select().from(users)
      .where(and(eq(users.id, driverId), eq(users.role, "driver" as any))).limit(1);
    if (!drv) return NextResponse.json({ error: "Chofer inválido" }, { status: 400 });
    if (["completado", "cancelado"].includes(svc.status as string))
      return NextResponse.json({ error: `No se puede asignar un traslado ${svc.status}` }, { status: 409 });
    await db.update(services).set({ driverId, status: "asignado" }).where(eq(services.id, serviceId));
    const nota = action === "reassign"
      ? `Reasignado a ${drv.name} desde panel admin`
      : `Asignado a ${drv.name} desde panel admin`;
    await db.insert(serviceEvents).values({ serviceId, type: "assigned" as any, note: nota });
    return NextResponse.json({ ok: true, status: "asignado", driver: drv.name });
  } catch (e) {
    console.error("service-action", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
