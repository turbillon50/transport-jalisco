import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, hasDb } from "@/db";
import pkg from "../../../../package.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  if (hasDb) {
    try {
      await db.execute(sql`SELECT 1`);
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }
  return NextResponse.json({ ok: true, db: dbOk, version: pkg.version ?? "0.0.0", time: new Date().toISOString() });
}
