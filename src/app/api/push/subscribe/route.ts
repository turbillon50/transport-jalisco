import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { dbUserIdByClerk } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  if (!hasDb) return NextResponse.json({ error: "sin DB" }, { status: 500 });

  const uid = await dbUserIdByClerk(userId);
  if (!uid) return NextResponse.json({ error: "usuario no sincronizado" }, { status: 409 });

  let sub: SubBody;
  try {
    sub = (await req.json()) as SubBody;
  } catch {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: "suscripción incompleta" }, { status: 400 });
  }

  try {
    await db
      .insert(pushSubscriptions)
      .values({ userId: uid, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: { userId: uid, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      });
  } catch (e) {
    console.error("[push/subscribe]", e);
    return NextResponse.json({ error: "no se pudo guardar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  try {
    const { endpoint } = (await req.json()) as { endpoint: string };
    if (endpoint && hasDb) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  } catch {
    /* noop */
  }
  return NextResponse.json({ ok: true });
}
