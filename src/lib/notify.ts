import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { notifications, users } from "@/db/schema";

/** Inserta una notificación in-app para un usuario (tolerante a fallos). */
export async function notifyUser(
  userId: string | null,
  n: { title: string; body: string; icon?: string },
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
}

/** Resuelve el id (uuid) del usuario en la DB a partir de su clerk_id. */
export async function dbUserIdByClerk(clerkId: string | null | undefined): Promise<string | null> {
  if (!hasDb || !clerkId) return null;
  try {
    const [r] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
    return r?.id ?? null;
  } catch {
    return null;
  }
}
