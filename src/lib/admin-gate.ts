import { cookies } from "next/headers";
import { createHash } from "node:crypto";

/**
 * "Llave-enlace" para el panel admin: el token secreto vive SOLO en la URL que
 * comparte el dueño (es la contraseña). En el repo guardamos únicamente su hash
 * SHA-256, que no revela el token. Abrir /<token> valida el hash, deja una cookie
 * httpOnly y abre /admin sin necesidad de login.
 *
 * Para rotar la llave: genera un token nuevo y reemplaza este hash con
 *   node -e "console.log(require('crypto').createHash('sha256').update('NUEVO_TOKEN').digest('hex'))"
 */
export const ADMIN_KEY_HASH = "e0450515a4ec482d4066268c5d3e995ae5ae5e9923141b9371f21671980429db";
export const ADMIN_COOKIE = "mt_admin";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** True si la cookie de acceso por llave-enlace es válida. */
export function hasAdminCookie(): boolean {
  return cookies().get(ADMIN_COOKIE)?.value === ADMIN_KEY_HASH;
}
