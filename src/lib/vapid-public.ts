/**
 * Llave VAPID pública (segura de exponer). Default embebido; se puede sobreescribir
 * con NEXT_PUBLIC_VAPID_PUBLIC_KEY. La privada vive SOLO en Vercel (VAPID_PRIVATE_KEY).
 */
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
  "BLAPs4rqBkllzHEX3UyDrEhQX3PPQ59Q-wsyOUFtyST7tLa3ihENTPUag0mFEe8tsr8eI9PQJHDHP1EUcl_rju4";
