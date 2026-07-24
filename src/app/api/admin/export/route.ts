import { NextResponse } from "next/server";
import { getServicesHistory } from "@/lib/queries-traslados";
import { getRole } from "@/lib/auth";
import { hasAdminCookie } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export async function GET(req: Request) {
  const authorized = hasAdminCookie() || ["admin", "ops"].includes(await getRole());
  if (!authorized) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const u = new URL(req.url);
  const rows = await getServicesHistory({
    estado: u.searchParams.get("estado") || undefined,
    q: u.searchParams.get("q") || undefined,
    desde: u.searchParams.get("desde") || undefined,
    hasta: u.searchParams.get("hasta") || undefined,
  }, 5000);

  const header = ["fecha_programada", "creado", "origen", "destino", "pasajeros", "empresa", "correo_empresa", "chofer", "precio_mxn", "estado", "id"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([
      r.scheduledAt ? new Date(r.scheduledAt).toISOString() : "",
      new Date(r.createdAt).toISOString(),
      cell(r.origin), cell(r.destination), r.passengers ?? "",
      cell(r.requesterName), cell(r.requesterEmail), cell(r.driverName),
      r.price ?? "", r.status, r.id,
    ].join(","));
  }
  const csv = "\uFEFF" + lines.join("\n");
  const fecha = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=mt-traslados-${fecha}.csv`,
      "Cache-Control": "no-store",
    },
  });
}
