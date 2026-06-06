import { NextResponse, type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { featureFlags } from "@/db/schema";
import { featureFlagsSeed } from "@/lib/mock";
import { ADMIN_KEY_HASH, hashToken } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Inicialización única de la base de datos, ejecutada DESDE Vercel (donde Neon sí
 * es alcanzable). Protegida por la llave del panel: /api/setup?key=<TOKEN>.
 * Crea las tablas (idempotente) y siembra los feature flags.
 */
const MIGRATION = `
CREATE TYPE "public"."event_type" AS ENUM('created', 'assigned', 'driver_arrived', 'started', 'location_update', 'completed', 'cancelled', 'alert');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'driver', 'ops', 'admin');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('pendiente', 'asignado', 'confirmado', 'en_curso', 'completado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('operativo', 'mantenimiento', 'inactivo');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"actor_id" text,"actor_name" text,"action" text NOT NULL,"target" text,"meta" text,"created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_flags" ("key" text PRIMARY KEY NOT NULL,"value" boolean DEFAULT false NOT NULL,"description" text,"updated_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"user_id" uuid,"title" text NOT NULL,"body" text NOT NULL,"icon" text DEFAULT 'notifications',"read" boolean DEFAULT false NOT NULL,"created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_events" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"service_id" uuid NOT NULL,"type" "event_type" NOT NULL,"location_lat" double precision,"location_lng" double precision,"note" text,"timestamp" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"user_id" uuid,"driver_id" uuid,"vehicle_id" uuid,"origin" text NOT NULL,"destination" text NOT NULL,"origin_lat" double precision,"origin_lng" double precision,"dest_lat" double precision,"dest_lng" double precision,"passengers" integer DEFAULT 1 NOT NULL,"scheduled_at" timestamp with time zone,"notes" text,"status" "service_status" DEFAULT 'pendiente' NOT NULL,"price" numeric(10, 2),"created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"clerk_id" text,"name" text NOT NULL,"email" text NOT NULL,"role" "role" DEFAULT 'user' NOT NULL,"phone" text,"avatar_url" text,"rating" numeric(2, 1),"created_at" timestamp with time zone DEFAULT now() NOT NULL,CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"));--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"plate" text NOT NULL,"model" text NOT NULL,"capacity" integer DEFAULT 4 NOT NULL,"status" "vehicle_status" DEFAULT 'operativo' NOT NULL,"image_url" text,"odometer" integer DEFAULT 0,"driver_id" uuid,"created_at" timestamp with time zone DEFAULT now() NOT NULL,CONSTRAINT "vehicles_plate_unique" UNIQUE("plate"));--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "service_events" ADD CONSTRAINT "service_events_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "services" ADD CONSTRAINT "services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "services" ADD CONSTRAINT "services_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "services" ADD CONSTRAINT "services_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscriptions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"user_id" uuid,"endpoint" text NOT NULL,"p256dh" text NOT NULL,"auth" text NOT NULL,"created_at" timestamp with time zone DEFAULT now() NOT NULL,CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint"));--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "rating" numeric(2, 1);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerk_id" text;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "image_url" text;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "odometer" integer DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."payment_method_type" AS ENUM('tarjeta','efectivo','transferencia','empresarial'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_methods" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"user_id" uuid NOT NULL,"type" "payment_method_type" NOT NULL,"label" text NOT NULL,"brand" text,"last4" text,"is_default" boolean DEFAULT false NOT NULL,"created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"service_id" uuid,"rater_id" uuid,"ratee_id" uuid NOT NULL,"stars" integer NOT NULL,"comment" text,"created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ratee_id_users_id_fk" FOREIGN KEY ("ratee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitations" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"code" text NOT NULL,"role" "role" NOT NULL,"label" text,"created_by" uuid,"created_by_name" text,"created_by_role" "role","used_by" uuid,"used_at" timestamp with time zone,"expires_at" timestamp with time zone,"active" boolean DEFAULT true NOT NULL,"created_at" timestamp with time zone DEFAULT now() NOT NULL,CONSTRAINT "invitations_code_unique" UNIQUE("code"));--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "invitations" ADD CONSTRAINT "invitations_used_by_users_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."role" AS ENUM('user','driver','ops','admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"service_id" uuid NOT NULL,"from_user" uuid,"from_name" text,"from_role" "role" NOT NULL,"to_role" "role","body" text NOT NULL,"read_at" timestamp with time zone,"created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "messages" ADD CONSTRAINT "messages_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "messages" ADD CONSTRAINT "messages_from_user_users_id_fk" FOREIGN KEY ("from_user") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_service_idx" ON "messages" ("service_id","created_at");
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."doc_kind" AS ENUM('foto_chofer','foto_unidad','licencia','tarjeta_circulacion','otro'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."doc_status" AS ENUM('pendiente','aprobado','rechazado'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "driver_documents" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"driver_id" uuid NOT NULL,"kind" "doc_kind" NOT NULL,"url" text NOT NULL,"file_name" text,"status" "doc_status" DEFAULT 'pendiente' NOT NULL,"note" text,"reviewed_by" text,"reviewed_at" timestamp with time zone,"created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "driver_documents" ADD CONSTRAINT "driver_documents_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "driver_documents_driver_idx" ON "driver_documents" ("driver_id","kind");
`;

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  if (hashToken(key) !== ADMIN_KEY_HASH) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!hasDb) {
    return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 500 });
  }

  // Un comando por ejecución (Neon HTTP usa prepared statements: no acepta
  // varios comandos juntos). Los bloques DO $$..$$ se respetan completos.
  const stmts = MIGRATION.split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((chunk) =>
      chunk.includes("$$")
        ? [chunk]
        : chunk
            .split(/;\s*(?:\n|$)/)
            .map((c) => c.trim())
            .filter(Boolean)
            .map((c) => `${c};`),
    );
  let applied = 0;
  const errors: string[] = [];

  for (const stmt of stmts) {
    try {
      await db.execute(sql.raw(stmt));
      applied++;
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      if (/already exists|duplicate/i.test(msg)) applied++;
      else errors.push(`${stmt.slice(0, 50)}… → ${msg}`);
    }
  }

  let seeded = 0;
  for (const f of featureFlagsSeed) {
    try {
      await db
        .insert(featureFlags)
        .values({ key: f.key, value: f.value, description: f.description })
        .onConflictDoNothing({ target: featureFlags.key });
      seeded++;
    } catch {
      /* idempotente */
    }
  }

  let tables: string[] = [];
  try {
    const res = await db.execute(
      sql.raw("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"),
    );
    const r = res as unknown as { rows?: Array<{ table_name: string }> } | Array<{ table_name: string }>;
    const rows = Array.isArray(r) ? r : r.rows ?? [];
    tables = rows.map((row) => row.table_name);
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: errors.length === 0, applied, total: stmts.length, seeded, tables, errors });
}
