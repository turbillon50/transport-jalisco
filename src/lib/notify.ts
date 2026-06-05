import { eq, and, isNull } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { notifications, users } from "@/db/schema";
import { sendPushToUser } from "@/lib/push";

/** Inserta una notificación in-app + Web Push para un usuario (tolerante a fallos). */
export async function notifyUser(
  userId: string | null,
  n: { title: string; body: string; icon?: string; url?: string },
): Promise<void> {
  if (!hasDb || !userId) return;
  try {
    await db.insert(notifications).values({
      userId,
      title: n.title,
      body: n.body,
      icon: n.icon ?? "notifications",
    });
  } catch (e) {
    console.error("[notify] insert:", e);
  }
  // Web Push en paralelo (no bloquea ni rompe si no hay suscripciones / VAPID).
  await sendPushToUser(userId, { title: n.title, body: n.body, url: n.url, icon: n.icon });
}

/** Resuelve el id (uuid) del usuario en la DB a partir de su clerk_id. */
export async function dbUserIdByClerk(clerkId: string | null | undefined): Promise<string | null> {
  if (!hasDb || !clerkId) return null;
  try {
    const [r] = await db.select({ id: users.id }).from(users).where(and(eq(users.clerkId, clerkId), isNull(users.deletedAt))).limit(1);
    return r?.id ?? null;
  } catch {
    return null;
  }
}
