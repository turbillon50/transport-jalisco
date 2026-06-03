import { db, hasDb } from "@/db";
import { featureFlags, users as usersTable, notifications } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { relativeTime } from "@/lib/utils";
import { dbUserIdByClerk } from "@/lib/notify";
import * as mock from "@/lib/mock";

export interface NotificationRow {
  id: string;
  title: string;
  body: string;
  icon: string;
  time: string;
  tone: "primary" | "secondary" | "error" | "muted";
  unread: boolean;
}

function toneFromIcon(icon: string, unread: boolean): NotificationRow["tone"] {
  if (/warning|error|report/.test(icon)) return "error";
  if (/check_circle|done/.test(icon)) return "muted";
  return unread ? "secondary" : "muted";
}

export async function getNotifications(): Promise<NotificationRow[]> {
  if (hasDb) {
    try {
      const { userId } = await auth();
      const uid = await dbUserIdByClerk(userId);
      if (uid) {
        const rows = await db
          .select()
          .from(notifications)
          .where(eq(notifications.userId, uid))
          .orderBy(desc(notifications.createdAt))
          .limit(50);
        if (rows.length) {
          return rows.map((r) => ({
            id: r.id,
            title: r.title,
            body: r.body,
            icon: r.icon ?? "notifications",
            time: relativeTime(r.createdAt),
            tone: toneFromIcon(r.icon ?? "", !r.read),
            unread: !r.read,
          }));
        }
      }
    } catch {
      /* fall through */
    }
  }
  return mock.notifications.map((n) => ({
    id: n.id, title: n.title, body: n.body, icon: n.icon, time: n.time, tone: n.tone, unread: n.unread,
  }));
}

export async function getUnreadCount(): Promise<number> {
  if (!hasDb) return mock.notifications.filter((n) => n.unread).length;
  try {
    const { userId } = await auth();
    const uid = await dbUserIdByClerk(userId);
    if (!uid) return 0;
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, uid), eq(notifications.read, false)));
    return rows.length;
  } catch {
    return 0;
  }
}

/**
 * Reads attempt the database and gracefully fall back to deterministic seed
 * data, so the UI is always faithful and the build never depends on DB access.
 */
export async function getFeatureFlags() {
  if (hasDb) {
    try {
      const rows = await db.select().from(featureFlags);
      if (rows.length) return rows.map((r) => ({ key: r.key, value: r.value, description: r.description ?? "" }));
    } catch {
      /* fall through to seed */
    }
  }
  return mock.featureFlagsSeed;
}

export interface AdminUserRow {
  id: string;
  clerkId: string | null;
  name: string;
  email: string;
  role: string;
  joined: string;
}

export async function getUsers(): Promise<AdminUserRow[]> {
  if (hasDb) {
    try {
      const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
      if (rows.length) {
        return rows.map((r) => ({
          id: r.id,
          clerkId: r.clerkId,
          name: r.name,
          email: r.email,
          role: r.role,
          joined: new Date(r.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
        }));
      }
    } catch {
      /* fall through to seed */
    }
  }
  return mock.adminUsers.map((u) => ({ id: u.id, clerkId: null, name: u.name, email: u.email, role: u.role, joined: u.joined }));
}
