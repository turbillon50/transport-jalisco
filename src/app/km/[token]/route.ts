import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { ADMIN_KEY_HASH, hashToken } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Manifest PWA dedicado al panel. Su `start_url` ES el enlace-llave, de modo que
 * el ícono instalado re-valida la llave en cada apertura y entra al panel.
 * Solo se sirve a quien ya posee la llave (token válido); si no, 404.
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  if (hashToken(params.token) !== ADMIN_KEY_HASH) notFound();

  const manifest = {
    name: "MT Empresarial · Panel",
    short_name: "MT Panel",
    description: "Panel administrativo de MT Empresarial",
    start_url: `/${params.token}`,
    id: `/${params.token}`,
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#091018",
    theme_color: "#002863",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "content-type": "application/manifest+json; charset=utf-8", "cache-control": "no-store" },
  });
}
