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
export const ADMIN_KEY_HASH = "1ee02b9e5bb410969021318076afd3b492b68b8b7e048f77a5e36c901ad4b4cb";
export const ADMIN_COOKIE = "mt_admin";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** True si la cookie de acceso por llave-enlace es válida. */
export function hasAdminCookie(): boolean {
  return cookies().get(ADMIN_COOKIE)?.value === ADMIN_KEY_HASH;
}
