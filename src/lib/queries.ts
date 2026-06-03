import { db, hasDb } from "@/db";
import { featureFlags, users as usersTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import * as mock from "@/lib/mock";

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
