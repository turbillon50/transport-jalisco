"use client";

// Salud — home del Admin Maestro (Forge). Score en anillo SVG animado,
// KPIs, alertas priorizadas y accesos. Monocromo estricto, sin sombras.
import { useEffect, useState } from "react";
import Link from "next/link";

type Kpi = { label: string; value: number; hint: string };
type Alert = { sev: "alta" | "media" | "baja"; title: string; body: string; href: string };

function useCount(target: number, ms = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

function Ring({ score }: { score: number }) {
  const v = useCount(score, 1100);
  const R = 54, C = 2 * Math.PI * R;
  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C - (C * v) / 100} transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset .3s linear" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 34, fontWeight: 300, lineHeight: 1 }}>{v}</p>
          <p style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--text2)", marginTop: 4 }}>SALUD</p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ k }: { k: Kpi }) {
  const v = useCount(k.value);
  return (
    <div className="fg-card" style={{ padding: 16 }}>
      <p style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--text2)" }}>{k.label.toUpperCase()}</p>
      <p style={{ fontSize: 28, fontWeight: 300, marginTop: 6, lineHeight: 1 }}>{v}</p>
      <p style={{ fontSize: 11, color: "var(--text2)", marginTop: 6 }}>{k.hint}</p>
    </div>
  );
}

export default function SaludClient({ kpis, alerts, score, weekly, audit }: {
  kpis: Kpi[]; alerts: Alert[]; score: number;
  weekly: { label: string; value: number }[];
  audit: { id: string | number; action: string; target: string; actor: string; time: string }[];
}) {
  const max = Math.max(1, ...weekly.map((w) => w.value));
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 1180, margin: "0 auto" }}>
      <section className="fg-card" style={{ padding: 20, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        <Ring score={score} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 16 }}>Estado de la operación</h2>
          <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, lineHeight: 1.6 }}>
            {alerts.length === 0
              ? "Sin incidencias abiertas. Traslados, choferes y verificaciones al corriente."
              : `${alerts.length} punto${alerts.length > 1 ? "s" : ""} requiere${alerts.length > 1 ? "n" : ""} atención. Revisa las alertas priorizadas abajo.`}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <Link href="/admin/traslados" className="fg-btn" style={{ textDecoration: "none" }}>Ir a traslados</Link>
            <Link href="/admin/mapa" className="fg-btn fg-btn2" style={{ textDecoration: "none" }}>Ver mapa en vivo</Link>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        {kpis.map((k) => <KpiCard key={k.label} k={k} />)}
      </section>

      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
        <div className="fg-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14 }}>Servicios · últimos 7 días</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, marginTop: 18 }}>
            {weekly.map((w) => (
              <div key={w.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", height: `${(w.value / max) * 100}%`, minHeight: 3, background: "var(--accent)", borderRadius: "4px 4px 0 0", transition: "height .5s ease" }} />
                <span className="fg-mono" style={{ color: "var(--text2)" }}>{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fg-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14 }}>Alertas priorizadas</h3>
          {alerts.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 14 }}>Nada pendiente. Todo en orden.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 10 }}>
              {alerts.map((a, i) => (
                <li key={i}>
                  <Link href={a.href} style={{ display: "flex", gap: 10, textDecoration: "none", color: "inherit", padding: 10, border: "1px solid var(--border)", borderRadius: 10 }}>
                    <span className="fg-mono" style={{ color: "var(--text2)", paddingTop: 2 }}>{a.sev.toUpperCase()}</span>
                    <span style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text2)" }}>{a.body}</p>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="fg-card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 14 }}>Bitácora</h3>
        {audit.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 14 }}>Las acciones aparecerán aquí.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 12 }}>
            {audit.map((a) => (
              <li key={a.id} style={{ display: "flex", gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--text2)", marginTop: 7, flexShrink: 0 }} />
                <span>
                  <p style={{ fontSize: 13 }}>{a.action}</p>
                  <p className="fg-mono" style={{ color: "var(--text2)" }}>{a.target} · {a.actor} · {a.time}</p>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
