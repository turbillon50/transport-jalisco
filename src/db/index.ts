import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

/**
 * Lazy, build-safe Drizzle client. The connection is only established the first
 * time a query runs (never at import / build time), so `next build` succeeds even
 * without DB connectivity. `hasDb` lets server components fall back to seed data.
 */
export const hasDb = Boolean(connectionString);

export const db = connectionString
  ? drizzle(neon(connectionString), { schema })
  : (null as unknown as ReturnType<typeof drizzle>);

export { schema };
