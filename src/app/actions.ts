"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { services, serviceEvents, featureFlags, auditLog, notifications, users, paymentMethods, ratings } from "@/db/schema";
import {
  sendServiceRequestedEmail,
  sendOpsNewServiceEmail,
  sendDriverAssignedEmail,
  sendServiceStatusEmail,
} from "@/lib/email";
import { notifyUser, dbUserIdByClerk } from "@/lib/notify";

async function meId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return dbUserIdByClerk(userId);
  } catch {
    return null;
  }
}

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
      const uid = await dbUserIdByClerk(userId);
      if (uid) {
        // Asociar el servicio al usuario y dejarle la notificación in-app.
        if (row) await db.update(services).set({ userId: uid }).where(eq(services.id, row.id));
        await notifyUser(uid, {
          title: "Solicitud recibida",
          body: `Tu traslado ${origin} → ${destination} fue registrado. Te avisaremos al asignar chofer.`,
          icon: "check_circle",
        });
      }
      await logAudit("Creó servicio", `${origin} → ${destination}`);
    } catch {
      return { ok: false, message: "No se pudo guardar el servicio. Intenta de nuevo." };
    }
  }

  // Notificaciones por correo (tolerantes a fallos): confirmación al usuario + aviso a operaciones.
  try {
    const u = await currentUser();
    const to = u?.emailAddresses?.[0]?.emailAddress;
    const name = u?.firstName ?? u?.username ?? "Usuario";
    const data = {
      origin,
      destination,
      passengers: Number.isFinite(passengers) ? passengers : 1,
      when: scheduled || undefined,
    };
    await Promise.allSettled([
      to ? sendServiceRequestedEmail(to, name, data) : Promise.resolve(),
      sendOpsNewServiceEmail(data),
    ]);
  } catch (e) {
    console.error("[createService] email:", e);
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
  if (hasDb) {
    try {
      const [row] = await db.update(users).set({ role }).where(eq(users.id, userId)).returning({ clerkId: users.clerkId });
      // Reflejar el rol también en Clerk para que el middleware enrute correcto.
      if (row?.clerkId) {
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(row.clerkId, { publicMetadata: { role } });
        } catch (e) {
          console.error("[updateUserRole] clerk:", e);
        }
      }
    } catch (e) {
      console.error("[updateUserRole] db:", e);
      return { ok: false, message: "No se pudo actualizar el rol." };
    }
  }
  await logAudit("Cambió rol de usuario", `${userId} → ${role}`);
  revalidatePath("/admin/users");
  return { ok: true, message: `Rol actualizado a ${role}.` };
}

export async function sendCampaign(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const segment = String(formData.get("segment") ?? "all");
  if (!title || !body) return { ok: false, message: "Título y mensaje son obligatorios." };

  let delivered = 0;
  if (hasDb) {
    try {
      const targets =
        segment === "all"
          ? await db.select({ id: users.id }).from(users)
          : await db.select({ id: users.id }).from(users).where(eq(users.role, segment as "user" | "driver" | "ops" | "admin"));
      if (targets.length) {
        await db.insert(notifications).values(targets.map((u) => ({ userId: u.id, title, body, icon: "campaign" })));
        delivered = targets.length;
      } else {
        await db.insert(notifications).values({ title, body, icon: "campaign" });
      }
      await logAudit("Envió campaña push", `${segment}: ${title}`);
    } catch {
      return { ok: false, message: "No se pudo registrar la campaña." };
    }
  }
  revalidatePath("/admin/notifications");
  revalidatePath("/app/alerts");
  return { ok: true, message: `Campaña enviada al segmento «${segment}»${delivered ? ` (${delivered} usuarios)` : ""}.` };
}

export async function assignDriver(serviceId: string, driverName: string): Promise<ActionResult> {
  if (hasDb) {
    try {
      const [svc] = await db
        .update(services)
        .set({ status: "asignado" })
        .where(eq(services.id, serviceId))
        .returning({ userId: services.userId, origin: services.origin, destination: services.destination, passengers: services.passengers });
      if (svc) {
        await db.insert(serviceEvents).values({ serviceId, type: "assigned", note: driverName });
        if (svc.userId) {
          await notifyUser(svc.userId, {
            title: "Chofer asignado",
            body: `${driverName} realizará tu traslado ${svc.origin} → ${svc.destination}.`,
            icon: "person_pin",
          });
          const [u] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, svc.userId)).limit(1);
          if (u?.email) {
            await sendDriverAssignedEmail(u.email, u.name, driverName, {
              origin: svc.origin,
              destination: svc.destination,
              passengers: svc.passengers,
            });
          }
        }
      }
    } catch (e) {
      console.error("[assignDriver]", e);
    }
  }
  await logAudit("Asignó servicio", `${serviceId} → ${driverName}`);
  revalidatePath("/ops/assignments");
  revalidatePath("/app/alerts");
  return { ok: true, message: `${driverName} asignado al servicio.` };
}

type ServiceStatus = "driver_arrived" | "started" | "completed";
const STATUS_COPY: Record<ServiceStatus, { title: string; body: string; icon: string; dbStatus: "en_curso" | "completado" }> = {
  driver_arrived: { title: "Tu chofer llegó", body: "tu chofer llegó al punto de origen.", icon: "location_on", dbStatus: "en_curso" },
  started: { title: "Servicio iniciado", body: "tu traslado comenzó. ¡Buen viaje!", icon: "navigation", dbStatus: "en_curso" },
  completed: { title: "Servicio completado", body: "tu trayecto finalizó con éxito. Gracias por viajar con MT Empresarial.", icon: "check_circle", dbStatus: "completado" },
};

/** Avance de estado del servicio por el chofer → notifica al usuario (in-app + correo). */
export async function advanceService(serviceId: string, status: ServiceStatus): Promise<ActionResult> {
  const copy = STATUS_COPY[status];
  if (hasDb) {
    try {
      const [svc] = await db
        .update(services)
        .set({ status: copy.dbStatus })
        .where(eq(services.id, serviceId))
        .returning({ userId: services.userId });
      if (svc) {
        await db.insert(serviceEvents).values({ serviceId, type: status });
        if (svc.userId) {
          await notifyUser(svc.userId, { title: copy.title, body: copy.body.charAt(0).toUpperCase() + copy.body.slice(1), icon: copy.icon });
          const [u] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, svc.userId)).limit(1);
          if (u?.email) await sendServiceStatusEmail(u.email, u.name, copy.title, copy.body);
        }
      }
    } catch (e) {
      console.error("[advanceService]", e);
    }
  }
  revalidatePath("/app/alerts");
  revalidatePath("/app/active");
  return { ok: true, message: copy.title };
}

/** Marca como leídas todas las notificaciones del usuario actual. */
export async function markNotificationsRead(): Promise<ActionResult> {
  if (hasDb) {
    try {
      const { userId } = await auth();
      const uid = await dbUserIdByClerk(userId);
      if (uid) await db.update(notifications).set({ read: true }).where(eq(notifications.userId, uid));
    } catch (e) {
      console.error("[markNotificationsRead]", e);
    }
  }
  revalidatePath("/app/alerts");
  return { ok: true, message: "Notificaciones marcadas como leídas." };
}

/* ----------------------------- perfil / foto ------------------------------ */
export async function updateProfilePhoto(url: string): Promise<ActionResult> {
  if (!url) return { ok: false, message: "Sin imagen." };
  if (hasDb) {
    try {
      const uid = await meId();
      if (uid) await db.update(users).set({ avatarUrl: url }).where(eq(users.id, uid));
    } catch (e) {
      console.error("[updateProfilePhoto]", e);
      return { ok: false, message: "No se pudo guardar la foto." };
    }
  }
  revalidatePath("/app/profile");
  return { ok: true, message: "Foto actualizada." };
}

/* --------------------------- formas de pago ------------------------------- */
export async function addPaymentMethod(formData: FormData): Promise<ActionResult> {
  const type = String(formData.get("type") ?? "tarjeta") as "tarjeta" | "efectivo" | "transferencia" | "empresarial";
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const last4 = String(formData.get("last4") ?? "").trim().slice(-4) || null;
  const labelMap: Record<string, string> = {
    tarjeta: brand ? `${brand} •••• ${last4 ?? ""}`.trim() : `Tarjeta •••• ${last4 ?? ""}`,
    efectivo: "Efectivo",
    transferencia: "Transferencia bancaria",
    empresarial: "Cargo empresarial",
  };
  if (!hasDb) return { ok: true, message: "Forma de pago agregada." };
  try {
    const uid = await meId();
    if (!uid) return { ok: false, message: "Usuario no sincronizado." };
    const existing = await db.select({ id: paymentMethods.id }).from(paymentMethods).where(eq(paymentMethods.userId, uid));
    await db.insert(paymentMethods).values({
      userId: uid,
      type,
      label: labelMap[type] ?? "Forma de pago",
      brand,
      last4,
      isDefault: existing.length === 0,
    });
  } catch (e) {
    console.error("[addPaymentMethod]", e);
    return { ok: false, message: "No se pudo agregar la forma de pago." };
  }
  revalidatePath("/app/profile");
  return { ok: true, message: "Forma de pago agregada." };
}

export async function deletePaymentMethod(id: string): Promise<ActionResult> {
  if (hasDb) {
    try {
      const uid = await meId();
      if (uid) await db.delete(paymentMethods).where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, uid)));
    } catch (e) {
      console.error("[deletePaymentMethod]", e);
    }
  }
  revalidatePath("/app/profile");
  return { ok: true, message: "Forma de pago eliminada." };
}

export async function setDefaultPaymentMethod(id: string): Promise<ActionResult> {
  if (hasDb) {
    try {
      const uid = await meId();
      if (uid) {
        await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, uid));
        await db.update(paymentMethods).set({ isDefault: true }).where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, uid)));
      }
    } catch (e) {
      console.error("[setDefaultPaymentMethod]", e);
    }
  }
  revalidatePath("/app/profile");
  return { ok: true, message: "Forma de pago predeterminada actualizada." };
}

/* ------------------------------ calificaciones ---------------------------- */
export async function rateService(serviceId: string, stars: number, comment: string): Promise<ActionResult> {
  const s = Math.max(1, Math.min(5, Math.round(stars)));
  if (!hasDb) return { ok: true, message: "¡Gracias por tu calificación!" };
  try {
    const raterId = await meId();
    // Califica a la contraparte del servicio (si soy el pasajero, califico al chofer; si soy chofer, al pasajero).
    const [svc] = await db
      .select({ userId: services.userId, driverId: services.driverId })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);
    if (!svc) return { ok: false, message: "Servicio no encontrado." };
    const rateeId = raterId === svc.driverId ? svc.userId : svc.driverId;
    if (!rateeId) return { ok: false, message: "No hay a quién calificar todavía." };

    await db.insert(ratings).values({ serviceId, raterId, rateeId, stars: s, comment: comment?.trim() || null });

    // Recalcular promedio del calificado.
    const rows = await db.select({ stars: ratings.stars }).from(ratings).where(eq(ratings.rateeId, rateeId));
    const avg = rows.reduce((a, r) => a + r.stars, 0) / rows.length;
    await db.update(users).set({ rating: avg.toFixed(1) }).where(eq(users.id, rateeId));
    await notifyUser(rateeId, { title: "Nueva calificación", body: `Recibiste ${s} estrellas por tu servicio.`, icon: "star" });
  } catch (e) {
    console.error("[rateService]", e);
    return { ok: false, message: "No se pudo registrar la calificación." };
  }
  revalidatePath("/app");
  return { ok: true, message: "¡Gracias por tu calificación!" };
}
