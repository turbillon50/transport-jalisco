"use client";

// Admin Maestro (Forge) — shell para MT Empresarial.
// Identidad Forge: monocromo estricto, Inter 300/400/500 (nunca bold),
// radios 10px, sin sombras en tarjetas, iconos SVG stroke inline.
// Candado movil: sidebar 236px -> drawer <768px, tap 44px, barra inferior fija.

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavItem = { href: string; label: string; icon: string; group: string };

const NAV: NavItem[] = [
  { href: "/admin", label: "Salud", icon: "M3 12h4l3-8 4 16 3-8h4", group: "OPERACIÓN" },
  { href: "/admin/traslados", label: "Traslados", icon: "M5 17h14M5 17a2 2 0 1 0 4 0M5 17V9l2-4h10l2 4v8M15 17a2 2 0 1 0 4 0M7 9h10", group: "OPERACIÓN" },
  { href: "/admin/mapa", label: "Mapa en vivo", icon: "M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15", group: "OPERACIÓN" },
  { href: "/admin/verificaciones", label: "Verificaciones", icon: "M9 12l2 2 4-4M12 3l7 3v6c0 4.5-3 8.3-7 9-4-.7-7-4.5-7-9V6l7-3z", group: "OPERACIÓN" },
  { href: "/admin/empresas", label: "Empresas", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01", group: "NEGOCIO" },
  { href: "/admin/reportes", label: "Reportes", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M8 13h8M8 17h5", group: "NEGOCIO" },
  { href: "/admin/analytics", label: "Analytics", icon: "M6 20V10M12 20V4M18 20v-6", group: "NEGOCIO" },
  { href: "/admin/drivers", label: "Choferes", icon: "M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 21a6 6 0 0 1 12 0M17 11h6M20 8v6", group: "PERSONAS" },
  { href: "/admin/users", label: "Usuarios", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", group: "PERSONAS" },
  { href: "/admin/invitations", label: "Invitaciones", icon: "M2 6h20v13H2zM2 7l10 7 10-7", group: "PERSONAS" },
  { href: "/admin/notifications", label: "Notificaciones", icon: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0", group: "PLATAFORMA" },
  { href: "/admin/settings", label: "Ajustes", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 3 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z", group: "PLATAFORMA" },
];

const GROUPS = ["OPERACIÓN", "NEGOCIO", "PERSONAS", "PLATAFORMA"];
const MOBILE = ["/admin", "/admin/traslados", "/admin/drivers", "/admin/mapa", "/admin/settings"];

const CSS = `
[data-forge]{--bg:#F9FAFC;--surface:#FFFFFF;--border:#E2E5ED;--text:#1F2937;--text2:#6B7280;--accent:#000000;--btn-fg:#FFFFFF;--hover:#F3F4F6;--shadow-el:0 8px 24px rgba(0,0,0,.12)}
[data-forge][data-theme="dark"]{--bg:#0C0D13;--surface:#141518;--border:#2A2C33;--text:#E5E7EB;--text2:#9CA3AF;--accent:#FFFFFF;--btn-fg:#000000;--hover:#1C1E24;--shadow-el:0 8px 24px rgba(0,0,0,.5)}
[data-forge]{background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-weight:400;-webkit-font-smoothing:antialiased}
[data-forge] *{font-weight:inherit}
[data-forge] h1,[data-forge] h2,[data-forge] h3,[data-forge] h4{font-weight:500;letter-spacing:-.01em;margin:0}
.fg-nav{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;color:var(--text2);text-decoration:none;font-size:13px;min-height:44px;transition:background .15s,color .15s}
.fg-nav:hover{background:var(--hover);color:var(--text)}
.fg-nav[data-on="1"]{background:var(--hover);color:var(--text);font-weight:500}
.fg-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:none}
.fg-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;min-height:40px;padding:0 16px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid transparent;background:var(--accent);color:var(--btn-fg)}
.fg-btn2{background:transparent;border-color:var(--border);color:var(--text)}
.fg-mono{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.02em}
.fg-scroll::-webkit-scrollbar{width:6px}.fg-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
@media(max-width:767px){[data-forge] input,[data-forge] select,[data-forge] textarea{font-size:16px}}
`;

function Ico({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function ForgeShell({ children, title, subtitle, role = "admin" }:
  { children: React.ReactNode; title?: string; subtitle?: string; role?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [drawer, setDrawer] = useState(false);
  const [pal, setPal] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = (localStorage.getItem("forge-theme") as "light" | "dark") || "light";
    setTheme(t);
  }, []);
  useEffect(() => { setDrawer(false); setPal(false); }, [pathname]);

  const toggle = useCallback(() => {
    setTheme((p) => { const n = p === "light" ? "dark" : "light"; localStorage.setItem("forge-theme", n); return n; });
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((v) => !v); }
      if (e.key === "Escape") setPal(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const current = NAV.find((n) => n.href === pathname);
  const heading = title || current?.label || "Panel";
  const results = NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase()));
  const crumb = pathname === "/admin" ? "mt / admin / salud" : `mt / admin / ${pathname.split("/").pop()}`;

  const Side = (
    <>
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden><path d="M0 0h16L8 14z" fill="var(--accent)" /></svg>
          <span style={{ fontWeight: 300, letterSpacing: "0.24em", fontSize: 13 }}>FORGE</span>
        </div>
        <p style={{ marginTop: 12, fontSize: 10, letterSpacing: ".14em", color: "var(--text2)" }}>TENANT</p>
        <p style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>MT Empresarial</p>
        <button onClick={() => setPal(true)} className="fg-btn fg-btn2"
          style={{ width: "100%", marginTop: 14, justifyContent: "space-between", minHeight: 38 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text2)" }}>
            <Ico d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" size={14} />Buscar
          </span>
          <span className="fg-mono" style={{ color: "var(--text2)" }}>⌘K</span>
        </button>
      </div>
      <nav className="fg-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {GROUPS.map((g) => (
          <div key={g} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--text2)", padding: "0 10px 6px" }}>{g}</p>
            {NAV.filter((n) => n.group === g).map((n) => (
              <Link key={n.href} href={n.href} className="fg-nav" data-on={pathname === n.href ? "1" : "0"}>
                <Ico d={n.icon} /><span>{n.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ borderTop: "1px solid var(--border)", padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--hover)", display: "grid", placeItems: "center" }}>
          <Ico d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" size={15} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500 }}>Administrador</p>
          <p style={{ fontSize: 11, color: "var(--text2)" }}>{role}</p>
        </div>
        <button onClick={toggle} aria-label="Cambiar tema" className="fg-btn fg-btn2" style={{ minHeight: 34, padding: "0 9px" }}>
          <Ico d={theme === "light" ? "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" : "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"} size={15} />
        </button>
      </div>
    </>
  );

  return (
    <div data-forge data-theme={theme} style={{ position: "fixed", inset: 0, display: "flex", zIndex: 40 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <aside className="hidden md:flex" style={{ width: 236, flexShrink: 0, flexDirection: "column", background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
        {Side}
      </aside>

      {drawer && (
        <div className="md:hidden" style={{ position: "fixed", inset: 0, zIndex: 60 }}>
          <div onClick={() => setDrawer(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" }} />
          <aside style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 236, display: "flex", flexDirection: "column", background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
            {Side}
          </aside>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <button onClick={() => setDrawer(true)} className="md:hidden fg-btn fg-btn2" aria-label="Menú" style={{ minHeight: 38, padding: "0 10px" }}>
            <Ico d="M3 6h18M3 12h18M3 18h18" />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 14 }}>{heading}</h1>
            <p className="fg-mono hidden sm:block" style={{ color: "var(--text2)" }}>{subtitle || crumb}</p>
          </div>
          <span className="hidden sm:flex" style={{ alignItems: "center", gap: 6, fontSize: 11, color: "var(--text2)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--text2)" }} />Sistema estable
          </span>
        </header>

        <main className="fg-scroll" style={{ flex: 1, overflowY: "auto", padding: 20, paddingBottom: 88 }}>
          {children}
        </main>

        <nav data-vulcano-bottomnav aria-label="Navegación admin" className="md:hidden"
          style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, display: "flex", background: "var(--surface)", borderTop: "1px solid var(--border)", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
          {MOBILE.map((h) => {
            const it = NAV.find((n) => n.href === h)!;
            const on = pathname === h;
            return (
              <Link key={h} href={h} style={{ flex: 1, minHeight: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, textDecoration: "none", color: on ? "var(--text)" : "var(--text2)" }}>
                <Ico d={it.icon} size={18} />
                <span style={{ fontSize: 10, fontWeight: on ? 500 : 400 }}>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {pal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "grid", placeItems: "start center", paddingTop: "12vh", background: "rgba(0,0,0,.45)" }}
          onClick={() => setPal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="fg-card"
            style={{ width: "min(560px,92vw)", boxShadow: "var(--shadow-el)", overflow: "hidden" }}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar pantalla…"
              style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14, borderBottom: "1px solid var(--border)" }} />
            <div className="fg-scroll" style={{ maxHeight: 320, overflowY: "auto", padding: 8 }}>
              <p style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--text2)", padding: "6px 10px" }}>IR A</p>
              {results.length === 0 && <p style={{ padding: "10px 12px", fontSize: 13, color: "var(--text2)" }}>Sin resultados</p>}
              {results.map((n) => (
                <button key={n.href} onClick={() => { setPal(false); setQ(""); router.push(n.href); }}
                  className="fg-nav" style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <Ico d={n.icon} /><span>{n.label}</span>
                  <span className="fg-mono" style={{ marginLeft: "auto", color: "var(--text2)" }}>{n.group}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
