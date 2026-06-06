import { NextResponse, type NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_KEY_HASH, hashToken } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Enlace-llave del panel. `mtempresarial.life/<token>`:
 * - Token inválido → 404.
 * - Token válido → deja cookie (en la bolsa actual, sea navegador o app instalada)
 *   y muestra una pantalla instalable cuyo manifest usa este mismo enlace como
 *   start_url. Así el ícono de escritorio re-valida la llave en cada apertura y
 *   entra directo al panel (persistente incluso en iOS).
 * - Si ya se abre desde el ícono (standalone) → entra directo a /admin.
 */
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  if (hashToken(params.token) !== ADMIN_KEY_HASH) notFound();

  const token = params.token;
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Panel · MT Empresarial</title>
<link rel="manifest" href="/km/${token}">
<meta name="theme-color" content="#002863">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="MT Panel">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="icon" href="/icons/icon-192.png">
<style>
 :root{color-scheme:dark}*{box-sizing:border-box}
 body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;
  font-family:Inter,system-ui,-apple-system,sans-serif;color:#fff;
  background:radial-gradient(circle at 20% 30%,#002863,transparent 50%),radial-gradient(circle at 80% 70%,#003d8f,transparent 50%),#001944}
 .card{width:100%;max-width:380px;text-align:center}
 .logo{width:150px;height:auto;background:#fff;border-radius:16px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,.35)}
 h1{font-size:20px;margin:22px 0 6px}p{opacity:.82;font-size:14px;margin:0 0 24px;line-height:1.5}
 a.btn{display:flex;align-items:center;justify-content:center;gap:8px;height:52px;border-radius:12px;background:#1e6bff;color:#fff;
  text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 10px 30px rgba(30,107,255,.45)}
 a.btn:active{transform:scale(.97)}.hint{margin-top:18px;font-size:12px;opacity:.65;line-height:1.55}
</style>
</head>
<body>
<div class="card">
 <img class="logo" src="/icons/logo.png" alt="MT Empresarial">
 <h1>Panel administrativo</h1>
 <p>Tu acceso quedó guardado en este dispositivo.</p>
 <a class="btn" href="/admin">Entrar al panel &rarr;</a>
 <div class="hint">Para dejarlo como app: menú del navegador &rarr; <b>Instalar</b> / <b>Agregar a inicio</b>. El ícono abrirá el panel directo y se mantendrá tu acceso.</div>
</div>
<script>
(function(){
  try{ localStorage.setItem("mt_panel","1"); }catch(e){}
  try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js'); }catch(e){}
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if(standalone){ location.replace('/admin'); }
})();
</script>
</body>
</html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
  res.cookies.set(ADMIN_COOKIE, ADMIN_KEY_HASH, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
