import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const db = drizzle(neon(process.env.DATABASE_URL));
const file = readFileSync("drizzle/0000_init.sql", "utf8");
const stmts = file
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

let ok = 0;
for (const stmt of stmts) {
  try {
    await db.execute(sql.raw(stmt));
    ok++;
  } catch (e) {
    if (/already exists|duplicate/i.test(String(e?.message))) ok++;
    else console.error("FAIL:", stmt.slice(0, 70).replace(/\n/g, " "), "->", e?.message);
  }
}

const tables = await db.execute(
  sql.raw("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
);
const rows = tables.rows ?? tables;
console.log(`Aplicadas ${ok}/${stmts.length} sentencias.`);
console.log("Tablas:", rows.map((t) => t.table_name).join(", "));
