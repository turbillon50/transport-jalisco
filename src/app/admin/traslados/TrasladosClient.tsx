"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string; origin: string; destination: string; status: string;
  price: string | null; scheduledAt: string | Date | null; createdAt: string | Date;
  passengers: number | null; requesterName: string | null; requesterEmail: string | null;
  driverId: string | null; driverName: string | null;
};
type Driver = { id: string; name: string };
type Filters = { estado?: string; q?: string; desde?: string; hasta?: string };

const ESTADOS = ["pendiente", "asignado", "confirmado", "en_curso", "completado", "cancelado"] as const;
const LABEL: Record<string, string> = {
  pendiente: "Pendiente", asignado: "Asignado", confirmado: "Confirmado",
  en_curso: "En curso", completado: "Completado", cancelado: "Cancelado",
};
const DOT: Record<string, string> = {
  pendiente: "#b8860b", asignado: "#2563eb", confirmado: "#0891b2",
  en_curso: "#16a34a", completado: "#9ca3af", cancelado: "#dc2626",
};
const CANCELABLES = ["pendiente", "asignado", "confirmado", "en_curso"];
const ASIGNABLES = ["pendiente", "asignado", "confirmado"];

function fmtDate(v: string | Date | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(+d)) return "—";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}
function fmtPrice(p: string | null): string {
  if (!p) return "—";
  const n = Number(p);
  return isNaN(n) ? "—" : "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

const S = {
  page: { padding: "22px 22px 90px", maxWidth: 1180, margin: "0 auto" } as React.CSSProperties,
  h1: { fontSize: 21, fontWeight: 500, letterSpacing: "-0.01em", margin: 0 } as React.CSSProperties,
  sub: { fontSize: 13, opacity: 0.55, marginTop: 3 } as React.CSSProperties,
  card: { border: "1px solid var(--fg-line, #e5e5e5)", borderRadius: 10, background: "var(--fg-card, transparent)" } as React.CSSProperties,
  chip: (on: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10,
    border: "1px solid var(--fg-line, #e5e5e5)", fontSize: 12.5, fontWeight: on ? 500 : 400,
    cursor: "pointer", textDecoration: "none", color: "inherit",
    background: on ? "var(--fg-inv, #111)" : "transparent",
    ...(on ? { color: "var(--fg-inv-text, #fff)", borderColor: "var(--fg-inv, #111)" } : {}),
  }),
  input: { padding: "8px 11px", borderRadius: 10, border: "1px solid var(--fg-line, #e5e5e5)", background: "transparent", fontSize: 13, color: "inherit", outline: "none" } as React.CSSProperties,
  btn: { padding: "7px 12px", borderRadius: 10, border: "1px solid var(--fg-line, #e5e5e5)", background: "transparent", fontSize: 12.5, cursor: "pointer", color: "inherit" } as React.CSSProperties,
  btnDark: { padding: "8px 14px", borderRadius: 10, border: "1px solid var(--fg-inv, #111)", background: "var(--fg-inv, #111)", color: "var(--fg-inv-text, #fff)", fontSize: 13, cursor: "pointer" } as React.CSSProperties,
};

export function TrasladosClient({ rows, counts, drivers, filters }: {
  rows: Row[]; counts: Record<string, number>; drivers: Driver[]; filters: Filters;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [modal, setModal] = useState<null | { kind: "assign" | "cancel"; row: Row }>(null);
  const [driverSel, setDriverSel] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<null | { ok: boolean; msg: string }>(null);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  function link(estado?: string) {
    const p = new URLSearchParams();
    if (estado) p.set("estado", estado);
    if (filters.q) p.set("q", filters.q);
    if (filters.desde) p.set("desde", filters.desde);
    if (filters.hasta) p.set("hasta", filters.hasta);
    const qs = p.toString();
    return "/admin/traslados" + (qs ? "?" + qs : "");
  }

  async function act(action: "cancel" | "assign" | "reassign", row: Row, driverId?: string) {
    setBusy(true); setFlash(null);
    try {
      const r = await fetch("/api/admin/service-action", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: row.id, action, driverId }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setFlash({ ok: false, msg: j.error || "Error " + r.status }); }
      else {
        setFlash({ ok: true, msg: action === "cancel" ? "Traslado cancelado" : "Chofer " + (j.driver || "") + " asignado" });
        setModal(null); setDriverSel("");
        startTransition(() => router.refresh());
      }
    } catch { setFlash({ ok: false, msg: "Sin conexión" }); }
    setBusy(false);
  }

  return (
    <div style={S.page}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={S.h1}>Traslados</h1>
          <p style={S.sub}>{total} en total · mostrando {rows.length}{pending ? " · actualizando…" : ""}</p>
        </div>
      </div>

      {/* chips de estado */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 12px" }}>
        <a href={link()} style={S.chip(!filters.estado)}>Todos</a>
        {ESTADOS.map((e) => (
          <a key={e} href={link(e)} style={S.chip(filters.estado === e)}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: DOT[e], display: "inline-block" }} />
            {LABEL[e]}{counts[e] ? " · " + counts[e] : ""}
          </a>
        ))}
      </div>

      {/* buscador + fechas (GET nativo) */}
      <form method="get" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {filters.estado ? <input type="hidden" name="estado" value={filters.estado} /> : null}
        <input name="q" defaultValue={filters.q || ""} placeholder="Buscar ruta, empresa o correo…" style={{ ...S.input, flex: "1 1 220px" }} />
        <input name="desde" type="date" defaultValue={filters.desde || ""} style={S.input} aria-label="Desde" />
        <input name="hasta" type="date" defaultValue={filters.hasta || ""} style={S.input} aria-label="Hasta" />
        <button type="submit" style={S.btn}>Filtrar</button>
        {(filters.q || filters.desde || filters.hasta) && (
          <a href={link(filters.estado)} style={{ ...S.btn, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
             onClick={(ev) => { ev.preventDefault(); router.push("/admin/traslados" + (filters.estado ? "?estado=" + filters.estado : "")); }}>
            Limpiar
          </a>
        )}
      </form>

      {flash && (
        <div style={{ ...S.card, padding: "10px 14px", marginBottom: 12, fontSize: 13, borderColor: flash.ok ? "#16a34a55" : "#dc262655" }}>
          {flash.msg}
        </div>
      )}

      {/* tabla */}
      <div style={{ ...S.card, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 760 }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.55, fontWeight: 400 }}>
                {["Fecha", "Ruta", "Empresa", "Chofer", "Precio", "Estado", ""].map((h) => (
                  <th key={h} style={{ padding: "11px 14px", fontWeight: 500, fontSize: 11.5, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid var(--fg-line, #e5e5e5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "38px 14px", textAlign: "center", opacity: 0.5 }}>Sin traslados con estos filtros</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--fg-line, #eee)" }}>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{fmtDate(r.scheduledAt || r.createdAt)}</td>
                  <td style={{ padding: "12px 14px", maxWidth: 260 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.origin}</div>
                    <div style={{ opacity: 0.55, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>→ {r.destination}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div>{r.requesterName || "—"}</div>
                    <div style={{ opacity: 0.5, fontSize: 12 }}>{r.requesterEmail || ""}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>{r.driverName || <span style={{ opacity: 0.45 }}>Sin asignar</span>}</td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{fmtPrice(r.price)}</td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 99, background: DOT[r.status] || "#999" }} />
                      {LABEL[r.status] || r.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap", textAlign: "right" }}>
                    {ASIGNABLES.includes(r.status) && (
                      <button style={{ ...S.btn, marginRight: 6 }} onClick={() => { setModal({ kind: "assign", row: r }); setDriverSel(r.driverId || ""); setFlash(null); }}>
                        {r.driverId ? "Reasignar" : "Asignar"}
                      </button>
                    )}
                    {CANCELABLES.includes(r.status) && (
                      <button style={{ ...S.btn, color: "#dc2626", borderColor: "#dc262655" }} onClick={() => { setModal({ kind: "cancel", row: r }); setFlash(null); }}>
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
             onClick={() => !busy && setModal(null)}>
          <div style={{ ...S.card, background: "var(--fg-bg, #fff)", width: "100%", maxWidth: 400, padding: 20 }} onClick={(e) => e.stopPropagation()}>
            {modal.kind === "cancel" ? (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>Cancelar traslado</h2>
                <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 16px" }}>
                  {modal.row.origin} → {modal.row.destination}. Esta acción queda en la bitácora y no se puede deshacer.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button style={S.btn} disabled={busy} onClick={() => setModal(null)}>Volver</button>
                  <button style={{ ...S.btnDark, background: "#dc2626", borderColor: "#dc2626" }} disabled={busy}
                          onClick={() => act("cancel", modal.row)}>
                    {busy ? "Cancelando…" : "Confirmar cancelación"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>{modal.row.driverId ? "Reasignar chofer" : "Asignar chofer"}</h2>
                <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 14px" }}>{modal.row.origin} → {modal.row.destination}</p>
                <select value={driverSel} onChange={(e) => setDriverSel(e.target.value)}
                        style={{ ...S.input, width: "100%", marginBottom: 16 }}>
                  <option value="">Selecciona chofer…</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id} disabled={d.id === modal.row.driverId}>
                      {d.name}{d.id === modal.row.driverId ? " (actual)" : ""}
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button style={S.btn} disabled={busy} onClick={() => setModal(null)}>Volver</button>
                  <button style={S.btnDark} disabled={busy || !driverSel || driverSel === modal.row.driverId}
                          onClick={() => act(modal.row.driverId ? "reassign" : "assign", modal.row, driverSel)}>
                    {busy ? "Guardando…" : "Confirmar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
