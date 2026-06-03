import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { users } from "@/db/schema";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook de Clerk (vía Svix). Sincroniza altas/cambios/bajas de usuarios hacia
 * la tabla `users`. Complementa el "lazy sync" del primer acceso con eventos
 * instantáneos y maneja el borrado (soft delete).
 * Configurar en Clerk → Webhooks: endpoint /api/webhooks/clerk, y añadir
 * CLERK_WEBHOOK_SIGNING_SECRET en Vercel.
 */
type ClerkEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    image_url?: string | null;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook no configurado (falta CLERK_WEBHOOK_SIGNING_SECRET)" }, { status: 503 });
  }

  const body = await req.text();
  const h = headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Faltan cabeceras svix" }, { status: 400 });
  }

  let evt: ClerkEvent;
  try {
    evt = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (!hasDb) return NextResponse.json({ ok: true });

  const { type, data } = evt;
  const email = data.email_addresses?.[0]?.email_address ?? "";
  const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || data.username || "Usuario";

  try {
    if (type === "user.created") {
      const inserted = await db
        .insert(users)
        .values({ clerkId: data.id, email, name, role: "user", avatarUrl: data.image_url ?? null })
        .onConflictDoNothing({ target: users.clerkId })
        .returning({ id: users.id });
      if (inserted.length && email) await sendWelcomeEmail(email, name);
    } else if (type === "user.updated") {
      await db.update(users).set({ email, name, avatarUrl: data.image_url ?? null }).where(eq(users.clerkId, data.id));
    } else if (type === "user.deleted") {
      await db.update(users).set({ deletedAt: new Date() }).where(eq(users.clerkId, data.id));
    }
  } catch (e) {
    console.error("[clerk webhook]", e);
    return NextResponse.json({ error: "Error procesando evento" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
