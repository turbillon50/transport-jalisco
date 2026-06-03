import { NextResponse, type NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_KEY_HASH, hashToken } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Enlace-llave de acceso al panel. `mtempresarial.life/<token>`:
 * - Si el token coincide con la llave secreta → deja cookie y abre /admin.
 * - Si no → 404 normal (no revela nada).
 * Las rutas estáticas (/app, /admin, /sign-in, etc.) tienen prioridad sobre
 * este segmento dinámico, así que no interfiere con la navegación normal.
 */
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  if (hashToken(params.token) !== ADMIN_KEY_HASH) {
    notFound();
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set(ADMIN_COOKIE, ADMIN_KEY_HASH, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
  return res;
}
