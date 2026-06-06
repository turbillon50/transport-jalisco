"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { services, serviceEvents, featureFlags, auditLog, notifications, users, vehicles, paymentMethods, ratings, invitations } from "@/db/schema";
import {
  sendServiceRequestedEmail,
  sendOpsNewServiceEmail,
  sendDriverAssignedEmail,
  sendServiceStatusEmail,
  sendInvitationEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import { notifyUser, dbUserIdByClerk } from "@/lib/notify";
import { getRole } from "@/lib/auth";
import { CAN_INVITE, ROLE_HOME, ROLE_LABEL, ROLE_RANK, type Role } from "@/lib/roles";
import { hasAdminCookie } from "@/lib/admin-gate";
import { ensureUser } from "@/lib/sync-user";
import { randomBytes } from "crypto";

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

/** Verifica que el rol actual esté dentro de los permitidos. */
async function requireRole(...allowed: ("user" | "driver" | "ops" | "admin")[]): Promise<boolean> {
  const role = await getRole();
  if (allowed.includes(role)) return true;
  // Admin por llave-enlace (cookie): permite acciones admin sin login de Clerk.
  if (allowed.includes("admin") && hasAdminCookie()) return true;
  return false;
}

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
      let uid = await dbUserIdByClerk(userId);
      if (!uid) {
        await ensureUser();
        uid = await dbUserIdByClerk(userId);
      }
      const [row] = await db
        .insert(services)
        .values({
          userId: uid,
          origin,
          destination,
          passengers: Number.isFinite(passengers) ? passengers : 1,
          notes,
          scheduledAt: scheduled ? new Date(scheduled) : null,
          status: "pendiente",
        })
        .returning({ id: services.id });
      if (row) await db.insert(serviceEvents).values({ serviceId: row.id, type: "created", note: `por ${userId ?? "usuario"}` });
      if (uid) {
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
  if (!(await requireRole("admin"))) return { ok: false, message: "No autorizado." };
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
  if (!(await requireRole("admin"))) return { ok: false, message: "No autorizado." };
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
  if (!(await requireRole("admin"))) return { ok: false, message: "No autorizado." };
  if (!title || !body) return { ok: false, message: "Título y mensaje son obligatorios." };

  let delivered = 0;
  if (hasDb) {
    try {
      const targets =
        segment === "all"
          ? await db.select({ id: users.id }).from(users)
          : await db.select({ id: users.id }).from(users).where(eq(users.role, segment as "user" | "driver" | "ops" | "admin"));
      if (!targets.length) {
        return { ok: false, message: "El segmento no tiene usuarios" };
      }
      await db.insert(notifications).values(targets.map((u) => ({ userId: u.id, title, body, icon: "campaign" })));
      delivered = targets.length;
      await logAudit("Envió campaña push", `${segment}: ${title}`);
    } catch {
      return { ok: false, message: "No se pudo registrar la campaña." };
    }
  }
  revalidatePath("/admin/notifications");
  revalidatePath("/app/alerts");
  return { ok: true, message: `Campaña enviada al segmento «${segment}»${delivered ? ` (${delivered} usuarios)` : ""}.` };
}

export async function assignDriver(serviceId: string, driverId: string, driverName: string): Promise<ActionResult> {
  if (!(await requireRole("ops", "admin"))) return { ok: false, message: "No autorizado." };
  if (hasDb) {
    try {
      const [svc] = await db
        .update(services)
        .set({ status: "asignado", driverId: driverId || null })
        .where(eq(services.id, serviceId))
        .returning({ userId: services.userId, origin: services.origin, destination: services.destination, passengers: services.passengers });
      if (svc) {
        await db.insert(serviceEvents).values({ serviceId, type: "assigned", note: driverName });
        // Notifica al chofer asignado.
        if (driverId) {
          await notifyUser(driverId, {
            title: "Nuevo servicio asignado",
            body: `Se te asignó el traslado ${svc.origin} → ${svc.destination}.`,
            icon: "directions_car",
            url: "/driver",
          });
        }
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
const VALID_PREV: Record<ServiceStatus, ("pendiente" | "asignado" | "confirmado" | "en_curso" | "completado" | "cancelado")[]> = {
  driver_arrived: ["asignado", "confirmado"],
  started: ["asignado", "confirmado", "en_curso"],
  completed: ["en_curso"],
};

export async function advanceService(serviceId: string, status: ServiceStatus): Promise<ActionResult> {
  const copy = STATUS_COPY[status];
  const role = await getRole();
  if (!["driver", "ops", "admin"].includes(role)) return { ok: false, message: "No autorizado." };
  if (hasDb) {
    try {
      const [current] = await db
        .select({ status: services.status, driverId: services.driverId })
        .from(services)
        .where(eq(services.id, serviceId))
        .limit(1);
      if (!current) return { ok: false, message: "Servicio no encontrado." };
      if (role === "driver") {
        const uid = await meId();
        if (!uid || current.driverId !== uid) return { ok: false, message: "No autorizado." };
      }
      if (!VALID_PREV[status].includes(current.status)) {
        return { ok: false, message: "Transición de estado no válida." };
      }
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


/* --------------------------------- choferes -------------------------------- */

/** Alta de chofer desde el panel admin (opcionalmente con vehículo). */
export async function createDriver(formData: FormData): Promise<ActionResult> {
  if (!(await requireRole("ops", "admin"))) return { ok: false, message: "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const emailIn = String(formData.get("email") ?? "").trim().toLowerCase();
  const plate = String(formData.get("plate") ?? "").trim().toUpperCase();
  const model = String(formData.get("model") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();

  if (!name || !phone) return { ok: false, message: "Nombre y teléfono son obligatorios." };
  if (!hasDb) return { ok: false, message: "Base de datos no configurada." };

  // Email placeholder único si no se proporciona (la columna es notNull).
  const email = emailIn || `chofer+${Math.random().toString(36).slice(2, 10)}@mtempresarial.life`;

  try {
    const [row] = await db
      .insert(users)
      .values({ name, email, role: "driver", phone })
      .returning({ id: users.id });
    if (!row) return { ok: false, message: "No se pudo crear el chofer." };

    if (plate) {
      const capacity = Number.isFinite(Number(capacityRaw)) && capacityRaw ? Number(capacityRaw) : 4;
      await db
        .insert(vehicles)
        .values({ plate, model: model || "Sin modelo", capacity, driverId: row.id })
        .onConflictDoUpdate({
          target: vehicles.plate,
          set: { model: model || "Sin modelo", capacity, driverId: row.id },
        });
    }

    await logAudit("driver.create", `${name} (${phone})`, plate ? `placa ${plate}` : undefined);
    revalidatePath("/admin/drivers");
    return { ok: true, message: `Chofer ${name} dado de alta.` };
  } catch (e) {
    console.error("[createDriver]", e);
    return { ok: false, message: "No se pudo crear el chofer. Revisa los datos (placa duplicada, etc.)." };
  }
}

/** Edita datos básicos de un chofer. */
export async function updateDriver(id: string, formData: FormData): Promise<ActionResult> {
  if (!(await requireRole("ops", "admin"))) return { ok: false, message: "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || !phone) return { ok: false, message: "Nombre y teléfono son obligatorios." };
  if (!hasDb) return { ok: false, message: "Base de datos no configurada." };

  try {
    await db
      .update(users)
      .set({ name, phone, ...(email ? { email } : {}) })
      .where(and(eq(users.id, id), eq(users.role, "driver")));
    await logAudit("driver.update", id, name);
    revalidatePath("/admin/drivers");
    return { ok: true, message: "Chofer actualizado." };
  } catch (e) {
    console.error("[updateDriver]", e);
    return { ok: false, message: "No se pudo actualizar el chofer." };
  }
}

/** Bloquea (soft-delete) o reactiva a un chofer. */
export async function setDriverBlocked(id: string, blocked: boolean): Promise<ActionResult> {
  if (!(await requireRole("ops", "admin"))) return { ok: false, message: "No autorizado." };
  if (!hasDb) return { ok: false, message: "Base de datos no configurada." };

  try {
    await db
      .update(users)
      .set({ deletedAt: blocked ? new Date() : null })
      .where(and(eq(users.id, id), eq(users.role, "driver")));
    await logAudit(blocked ? "driver.block" : "driver.unblock", id);
    revalidatePath("/admin/drivers");
    return { ok: true, message: blocked ? "Chofer bloqueado." : "Chofer reactivado." };
  } catch (e) {
    console.error("[setDriverBlocked]", e);
    return { ok: false, message: "No se pudo cambiar el estado del chofer." };
  }
}

/* ============================ INVITACIONES POR ROL ============================ */

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || "https://mtempresarial.life";

export type InvitationRow = {
  id: string;
  code: string;
  role: Role;
  label: string | null;
  status: "Activa" | "Usada" | "Revocada" | "Expirada";
  usedByName: string | null;
  createdAt: string;
  url: string;
};

/** Resuelve {id, name} del usuario actual en la tabla `users`. */
async function meIdAndName(): Promise<{ id: string | null; name: string }> {
  const a = await actor();
  const id = await meId();
  return { id, name: a.name };
}

/** Crea una invitación para un rol permitido por la jerarquía del invitador. */
export async function createInvitation(
  role: Role,
  opts?: { label?: string; email?: string; expiresInDays?: number },
): Promise<ActionResult & { code?: string; url?: string }> {
  const caller = await getRole();
  if (!CAN_INVITE[caller].includes(role)) {
    return { ok: false, message: "No puedes invitar a ese rol." };
  }
  if (!hasDb) return { ok: false, message: "Base de datos no configurada." };

  const { id: miId, name: miNombre } = await meIdAndName();

  try {
    let code = "";
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      code = randomBytes(4).toString("hex").toUpperCase();
      try {
        await db.insert(invitations).values({
          code,
          role,
          label: opts?.label?.trim() || null,
          createdBy: miId,
          createdByName: miNombre,
          createdByRole: caller,
          expiresAt:
            opts?.expiresInDays && opts.expiresInDays > 0
              ? new Date(Date.now() + opts.expiresInDays * 86400_000)
              : null,
          active: true,
        });
        inserted = true;
      } catch (e) {
        const msg = String((e as Error)?.message ?? e);
        if (!/unique|duplicate/i.test(msg)) throw e;
      }
    }
    if (!inserted) return { ok: false, message: "No se pudo generar el código, intenta de nuevo." };

    const url = `${APP_BASE}/invite/${code}`;
    await logAudit("invite.create", role, code);

    const email = opts?.email?.trim().toLowerCase();
    if (email) {
      sendInvitationEmail(email, miNombre, ROLE_LABEL[role], url).catch(() => {});
    }

    revalidatePath("/invitar");
    return { ok: true, message: "Invitación creada.", code, url };
  } catch (e) {
    console.error("[createInvitation]", e);
    return { ok: false, message: "No se pudo crear la invitación." };
  }
}

/** Lista las invitaciones del usuario (todas si es admin). */
export async function getMyInvitations(): Promise<InvitationRow[]> {
  if (!hasDb) return [];
  const caller = await getRole();
  const miId = await meId();

  try {
    const usedByUser = users;
    const rows = await db
      .select({
        id: invitations.id,
        code: invitations.code,
        role: invitations.role,
        label: invitations.label,
        active: invitations.active,
        usedBy: invitations.usedBy,
        usedByName: usedByUser.name,
        expiresAt: invitations.expiresAt,
        createdAt: invitations.createdAt,
      })
      .from(invitations)
      .leftJoin(usedByUser, eq(invitations.usedBy, usedByUser.id))
      .where(caller === "admin" || !miId ? sql`true` : eq(invitations.createdBy, miId))
      .orderBy(desc(invitations.createdAt));

    if (caller !== "admin" && !miId) return [];

    return rows.map((r) => {
      const expired = r.expiresAt ? new Date(r.expiresAt).getTime() < Date.now() : false;
      let status: InvitationRow["status"];
      if (r.usedBy) status = "Usada";
      else if (!r.active) status = "Revocada";
      else if (expired) status = "Expirada";
      else status = "Activa";
      return {
        id: r.id,
        code: r.code,
        role: r.role as Role,
        label: r.label,
        status,
        usedByName: r.usedByName ?? null,
        createdAt: new Date(r.createdAt).toISOString(),
        url: `${APP_BASE}/invite/${r.code}`,
      };
    });
  } catch (e) {
    console.error("[getMyInvitations]", e);
    return [];
  }
}

/** Revoca una invitación; si fue usada por un subordinado no-admin, revoca su acceso. */
export async function revokeInvitation(id: string): Promise<ActionResult> {
  if (!hasDb) return { ok: false, message: "Base de datos no configurada." };
  const caller = await getRole();
  const miId = await meId();

  try {
    const [inv] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.id, id))
      .limit(1);
    if (!inv) return { ok: false, message: "Invitación no encontrada." };

    const esCreador = miId && inv.createdBy === miId;
    if (caller !== "admin" && !esCreador) {
      return { ok: false, message: "No autorizado." };
    }

    await db.update(invitations).set({ active: false }).where(eq(invitations.id, id));

    // Si ya fue usada por un subordinado (rank menor, no admin), revoca su acceso.
    if (inv.usedBy) {
      const [target] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, inv.usedBy))
        .limit(1);
      if (target && target.role !== "admin" && ROLE_RANK[target.role as Role] < ROLE_RANK[caller]) {
        await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, inv.usedBy));
      }
    }

    await logAudit("invite.revoke", inv.code);
    revalidatePath("/invitar");
    return { ok: true, message: "Invitación revocada." };
  } catch (e) {
    console.error("[revokeInvitation]", e);
    return { ok: false, message: "No se pudo revocar la invitación." };
  }
}

/** Registro público con código de invitación (estilo Castores: server-to-server + ticket). */
export async function registerWithInvite(input: {
  code: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  acceptTerms: boolean;
}): Promise<ActionResult & { ticketUrl?: string; role?: Role }> {
  const code = String(input.code ?? "").trim().toUpperCase();
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const phone = String(input.phone ?? "").trim() || null;

  if (!input.acceptTerms) return { ok: false, message: "Debes aceptar los Términos y la Privacidad." };
  if (!name) return { ok: false, message: "Tu nombre es obligatorio." };
  if (!email || !email.includes("@")) return { ok: false, message: "Correo inválido." };
  if (password.length < 8) return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };
  if (!code) return { ok: false, message: "Falta el código de invitación." };
  if (!hasDb) return { ok: false, message: "Base de datos no configurada." };

  try {
    // 1) Valida la invitación.
    const [inv] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.code, code))
      .limit(1);
    if (!inv || !inv.active || inv.usedBy) {
      return { ok: false, message: "Invitación no válida o ya utilizada." };
    }
    if (inv.expiresAt && new Date(inv.expiresAt).getTime() < Date.now()) {
      return { ok: false, message: "La invitación expiró." };
    }

    // 2) ¿Correo ya registrado (con clerkId)?
    const [existing] = await db
      .select({ id: users.id, clerkId: users.clerkId })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);
    if (existing?.clerkId) {
      return { ok: false, message: "Ese correo ya está registrado, inicia sesión." };
    }

    // 3) Crea el usuario en Clerk (email pre-verificado por Backend API).
    const parts = name.split(/\s+/);
    const firstName = parts[0] ?? name;
    const lastName = parts.slice(1).join(" ") || undefined;

    const client = await clerkClient();
    let clerkUserId: string;
    try {
      const created = await client.users.createUser({
        emailAddress: [email],
        password,
        firstName,
        lastName,
        publicMetadata: { role: inv.role },
        skipPasswordChecks: false,
      });
      clerkUserId = created.id;
    } catch (e: unknown) {
      const err = e as { errors?: Array<{ long_message?: string; message?: string }> };
      const long = err?.errors?.[0]?.long_message || err?.errors?.[0]?.message;
      console.error("[registerWithInvite] Clerk createUser:", e);
      return { ok: false, message: long || "No se pudo crear la cuenta. Revisa tus datos." };
    }

    // 4) Upsert en la tabla users (después de Clerk, para no dejar basura).
    let userRowId: string;
    if (existing && !existing.clerkId) {
      await db
        .update(users)
        .set({ clerkId: clerkUserId, role: inv.role, name, phone })
        .where(eq(users.id, existing.id));
      userRowId = existing.id;
    } else {
      const [row] = await db
        .insert(users)
        .values({ clerkId: clerkUserId, name, email, role: inv.role, phone })
        .returning({ id: users.id });
      userRowId = row.id;
    }

    // 5) Marca la invitación como usada.
    await db
      .update(invitations)
      .set({ usedBy: userRowId, usedAt: new Date(), active: false })
      .where(eq(invitations.id, inv.id));

    await logAudit("invite.accept", inv.role, code);

    // 6) Emite un sign_in_token de un solo uso → entra directo a su panel.
    const t = await client.signInTokens.createSignInToken({
      userId: clerkUserId,
      expiresInSeconds: 600,
    });
    const ticketUrl = `/sign-in?__clerk_ticket=${t.token}&redirect_url=${encodeURIComponent(ROLE_HOME[inv.role as Role])}`;

    // 7) Bienvenida (no bloqueante).
    sendWelcomeEmail(email, firstName).catch(() => {});

    return { ok: true, message: "Cuenta creada.", ticketUrl, role: inv.role as Role };
  } catch (e) {
    console.error("[registerWithInvite]", e);
    return { ok: false, message: "No se pudo completar el registro. Intenta de nuevo." };
  }
}
