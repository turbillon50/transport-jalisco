import { db, hasDb } from "@/db";
import { featureFlags } from "@/db/schema";
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
