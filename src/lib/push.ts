import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { VAPID_PUBLIC_KEY } from "@/lib/vapid-public";

const PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:soporte@mtempresarial.life";

let configured = false;
function ensureConfigured(): boolean {
  if (!PRIVATE) return false;
  if (!configured) {
    webpush.setVapidDetails(SUBJECT, VAPID_PUBLIC_KEY, PRIVATE);
    configured = true;
  }
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/** Envía Web Push a todas las suscripciones de un usuario. Best-effort; poda las muertas. */
export async function sendPushToUser(userId: string | null, payload: PushPayload): Promise<void> {
  if (!hasDb || !userId || !ensureConfigured()) return;
  try {
    const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    const data = JSON.stringify({ ...payload, url: payload.url ?? "/app/alerts" });
    await Promise.allSettled(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            data,
          );
        } catch (e) {
          const code = (e as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) {
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
          }
        }
      }),
    );
  } catch (e) {
    console.error("[push] sendPushToUser:", e);
  }
}
