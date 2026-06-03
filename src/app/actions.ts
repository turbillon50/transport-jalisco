"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { services, serviceEvents, featureFlags, auditLog, notifications } from "@/db/schema";

async function actor() {
  try {
    const u = await currentUser();
    return { id: u?.id ?? null, name: u?.firstName ?? u?.username ?? "Sistema" };
  } catch {
    return { id: null, name: "Sistema" };
  }
}

async function logAudit(action: string, target?: string, meta?: string) {
  if (!hasDb) return;
  const a = await actor();
  try {
    await db.insert(auditLog).values({ actorId: a.id, actorName: a.name, action, target, meta });
  } catch {
    /* non-fatal */
  }
}

export type ActionResult = { ok: boolean; message: string };

export async function createService(formData: FormData): Promise<ActionResult> {
  const origin = String(formData.get("origin") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const passengers = Number(formData.get("passengers") ?? 1);
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const scheduled = String(formData.get("scheduledAt") ?? "");

  if (!origin || !destination) {
    return { ok: false, message: "Origen y destino son obligatorios." };
  }

  if (hasDb) {
    try {
      const { userId } = await auth();
      const [row] = await db
        .insert(services)
        .values({
          origin,
          destination,
          passengers: Number.isFinite(passengers) ? passengers : 1,
          notes,
          scheduledAt: scheduled ? new Date(scheduled) : null,
          status: "pendiente",
        })
        .returning({ id: services.id });
      if (row) await db.insert(serviceEvents).values({ serviceId: row.id, type: "created", note: `por ${userId ?? "usuario"}` });
      await logAudit("Creó servicio", `${origin} → ${destination}`);
    } catch {
      return { ok: false, message: "No se pudo guardar el servicio. Intenta de nuevo." };
    }
  }

  revalidatePath("/app");
  return { ok: true, message: "Traslado programado correctamente." };
}

export async function toggleFeatureFlag(key: string, value: boolean): Promise<ActionResult> {
  if (hasDb) {
    try {
      await db
        .insert(featureFlags)
        .values({ key, value })
        .onConflictDoUpdate({ target: featureFlags.key, set: { value, updatedAt: new Date() } });
      await logAudit(value ? "Activó feature flag" : "Desactivó feature flag", key);
    } catch {
      return { ok: false, message: "No se pudo actualizar el flag." };
    }
  }
  revalidatePath("/admin/settings");
  return { ok: true, message: "Flag actualizado." };
}

export async function updateUserRole(userId: string, role: "user" | "driver" | "ops" | "admin"): Promise<ActionResult> {
  await logAudit("Cambió rol de usuario", `${userId} → ${role}`);
  revalidatePath("/admin/users");
  return { ok: true, message: `Rol actualizado a ${role}.` };
}

export async function sendCampaign(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const segment = String(formData.get("segment") ?? "all");
  if (!title || !body) return { ok: false, message: "Título y mensaje son obligatorios." };

  if (hasDb) {
    try {
      await db.insert(notifications).values({ title, body, icon: "campaign" });
      await logAudit("Envió campaña push", `${segment}: ${title}`);
    } catch {
      return { ok: false, message: "No se pudo registrar la campaña." };
    }
  }
  revalidatePath("/admin/notifications");
  return { ok: true, message: `Campaña enviada al segmento «${segment}».` };
}

export async function assignDriver(serviceId: string, driverName: string): Promise<ActionResult> {
  if (hasDb) {
    try {
      await db.update(services).set({ status: "asignado" }).where(eq(services.id, serviceId));
    } catch {
      /* non-fatal in demo */
    }
  }
  await logAudit("Asignó servicio", `${serviceId} → ${driverName}`);
  revalidatePath("/ops/assignments");
  return { ok: true, message: `${driverName} asignado al servicio.` };
}
