import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { users } from "@/db/schema";
import { sendWelcomeEmail } from "./email";
import type { Role } from "./roles";

/**
 * Sincroniza al usuario autenticado de Clerk hacia la tabla `users` de Neon en su
 * primer acceso (modelo "lazy sync"): no requiere webhooks ni tocar el dashboard.
 * - Si es nuevo: lo inserta, fija su rol por defecto ("user") en Clerk y envía
 *   el correo de bienvenida (una sola vez).
 * - Si ya existe: refresca nombre/email/avatar.
 * Tolerante a fallos: cualquier error se registra y NO rompe el render.
 */
export async function ensureUser(): Promise<void> {
  let u;
  try {
    u = await currentUser();
  } catch {
    return;
  }
  if (!u) return;

  const email = u.emailAddresses?.[0]?.emailAddress ?? "";
  const name = u.firstName ?? u.username ?? "Usuario";
  const role = (u.publicMetadata?.role as Role | undefined) ?? null;

  // Asigna rol por defecto en Clerk si aún no tiene (los registros entran como "user").
  if (!role) {
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(u.id, { publicMetadata: { role: "user" } });
    } catch (e) {
      console.error("[sync-user] no se pudo fijar el rol:", e);
    }
  }

  if (!hasDb) return;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, u.id))
      .limit(1);

    if (existing.length === 0) {
      await db
        .insert(users)
        .values({
          clerkId: u.id,
          name,
          email,
          role: role ?? "user",
          avatarUrl: u.imageUrl ?? null,
        })
        .onConflictDoNothing({ target: users.clerkId });
      if (email) await sendWelcomeEmail(email, name);
    } else {
      await db
        .update(users)
        .set({ name, email, avatarUrl: u.imageUrl ?? null })
        .where(eq(users.clerkId, u.id));
    }
  } catch (e) {
    console.error("[sync-user] error de DB:", e);
  }
}
