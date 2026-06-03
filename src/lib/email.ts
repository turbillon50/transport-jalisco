import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "MT Empresarial <hola@mtempresarial.life>";
const OPS_EMAIL = process.env.OPS_EMAIL ?? "operaciones@mtempresarial.life";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mtempresarial.life";

/** Envío tolerante a fallos: nunca rompe el flujo de la app si Resend falla. */
async function send(opts: { to: string | string[]; subject: string; html: string }) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY ausente; se omite envío:", opts.subject);
    return { skipped: true };
  }
  try {
    const res = await resend.emails.send({ from: FROM, ...opts });
    if (res.error) console.error("[email] Resend error:", res.error);
    return res;
  } catch (e) {
    console.error("[email] excepción:", e);
    return { error: e };
  }
}

function shell(title: string, body: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f7f9fc;font-family:Inter,Segoe UI,Arial,sans-serif;color:#191c1e">
  <div style="max-width:520px;margin:0 auto;padding:24px">
    <div style="background:#002863;border-radius:16px 16px 0 0;padding:28px 28px 22px;text-align:center">
      <div style="color:#fff;font-size:20px;font-weight:800;letter-spacing:.3px">MT Empresarial</div>
      <div style="color:#adc7ff;font-size:12px;margin-top:4px">Logística de Confianza</div>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 16px 16px;padding:28px">
      <h1 style="font-size:20px;margin:0 0 12px;color:#002863">${title}</h1>
      ${body}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin:18px 0 0">© ${new Date().getFullYear()} MT Empresarial · Tu destino, nuestra ruta</p>
  </div></body></html>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#1e6bff;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;margin-top:8px">${label}</a>`;

export async function sendWelcomeEmail(to: string, name: string) {
  return send({
    to,
    subject: "Bienvenido a MT Empresarial 🚐",
    html: shell(
      `¡Hola, ${name}!`,
      `<p style="line-height:1.6;color:#434651">Tu cuenta quedó lista. Desde la app puedes solicitar traslados,
       seguir tu servicio en vivo y revisar tu historial.</p>
       <p style="margin-top:16px">${btn(`${APP_URL}/app/request`, "Solicitar mi primer traslado")}</p>`,
    ),
  });
}

export interface ServiceEmailData {
  origin: string;
  destination: string;
  passengers: number;
  when?: string;
  id?: string;
}

export async function sendServiceRequestedEmail(to: string, name: string, s: ServiceEmailData) {
  return send({
    to,
    subject: "Recibimos tu solicitud de traslado",
    html: shell(
      "Solicitud recibida ✅",
      `<p style="line-height:1.6;color:#434651">Hola ${name}, registramos tu traslado. Operaciones lo está procesando
       y te avisaremos al asignar chofer.</p>
       <table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:14px">
         <tr><td style="padding:8px 0;color:#737783">Origen</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.origin}</td></tr>
         <tr><td style="padding:8px 0;color:#737783">Destino</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.destination}</td></tr>
         <tr><td style="padding:8px 0;color:#737783">Pasajeros</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.passengers}</td></tr>
         ${s.when ? `<tr><td style="padding:8px 0;color:#737783">Fecha/hora</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.when}</td></tr>` : ""}
       </table>
       <p style="margin-top:16px">${btn(`${APP_URL}/app`, "Ver mis traslados")}</p>`,
    ),
  });
}

export async function sendOpsNewServiceEmail(s: ServiceEmailData) {
  return send({
    to: OPS_EMAIL,
    subject: `Nuevo traslado por asignar: ${s.origin} → ${s.destination}`,
    html: shell(
      "Traslado sin asignar 🟠",
      `<p style="line-height:1.6;color:#434651">Entró una solicitud nueva que requiere asignación de chofer.</p>
       <table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:14px">
         <tr><td style="padding:8px 0;color:#737783">Origen</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.origin}</td></tr>
         <tr><td style="padding:8px 0;color:#737783">Destino</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.destination}</td></tr>
         <tr><td style="padding:8px 0;color:#737783">Pasajeros</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.passengers}</td></tr>
       </table>
       <p style="margin-top:16px">${btn(`${APP_URL}/ops/assignments`, "Ir a asignaciones")}</p>`,
    ),
  });
}

export async function sendDriverAssignedEmail(to: string, name: string, driverName: string, s: ServiceEmailData) {
  return send({
    to,
    subject: "Tu chofer fue asignado 🚗",
    html: shell(
      "Chofer asignado",
      `<p style="line-height:1.6;color:#434651">Hola ${name}, <b>${driverName}</b> realizará tu traslado
       <b>${s.origin} → ${s.destination}</b>. Te avisaremos cuando vaya en camino.</p>
       <p style="margin-top:16px">${btn(`${APP_URL}/app/active`, "Seguir en vivo")}</p>`,
    ),
  });
}

export async function sendDriverNewServiceEmail(to: string, driverName: string, s: ServiceEmailData) {
  return send({
    to,
    subject: `Nuevo servicio asignado: ${s.origin} → ${s.destination}`,
    html: shell(
      `Hola ${driverName}`,
      `<p style="line-height:1.6;color:#434651">Se te asignó un nuevo traslado.</p>
       <table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:14px">
         <tr><td style="padding:8px 0;color:#737783">Origen</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.origin}</td></tr>
         <tr><td style="padding:8px 0;color:#737783">Destino</td><td style="padding:8px 0;font-weight:700;text-align:right">${s.destination}</td></tr>
       </table>
       <p style="margin-top:16px">${btn(`${APP_URL}/driver`, "Ver mi panel")}</p>`,
    ),
  });
}

export async function sendServiceStatusEmail(to: string, name: string, title: string, body: string) {
  return send({
    to,
    subject: title,
    html: shell(title, `<p style="line-height:1.6;color:#434651">Hola ${name}, ${body}</p>
      <p style="margin-top:16px">${btn(`${APP_URL}/app/active`, "Ver mi servicio")}</p>`),
  });
}
