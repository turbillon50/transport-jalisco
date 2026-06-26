import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, hasDb } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasDb) return NextResponse.json({ error: "No DB" }, { status: 503 });
    const { serviceId, driverId } = await req.json();
    if (!serviceId || !driverId) return NextResponse.json({ error: "Missing" }, { status: 400 });
    await db.update(services).set({ driverId, status: "asignado" }).where(eq(services.id, serviceId));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
