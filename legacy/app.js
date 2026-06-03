/* MT Empresarial PWA — SPA shell controller.
   Loads Google Stitch screen fragments into a unified, role-aware app shell
   with native-feeling navigation, transitions and offline support. */
(() => {
  "use strict";

  const SCREENS = {
    splash:   { file: "splash_screen",          chrome: "none" },
    roles:    { file: "role_selection",         chrome: "none" },
    home:     { file: "user_home",               chrome: "tab",    role: "user",   title: "Inicio" },
    services: { file: "my_services",             chrome: "tab",    role: "user",   title: "Mis traslados" },
    request:  { file: "request_transportation",  chrome: "detail", role: "user",   title: "Nuevo traslado", back: "home" },
    service:  { file: "service_detail",          chrome: "detail", role: null,     title: "Detalle del servicio", back: "services" },
    alerts:   { file: "notifications_center",    chrome: "tab",    role: null,     title: "Notificaciones" },
    driver:   { file: "driver_dashboard",        chrome: "tab",    role: "driver", title: "Panel del chofer" },
    active:   { file: "active_service",          chrome: "tab",    role: "driver", title: "Servicio en curso", back: "driver" },
    dispatch: { file: "dispatcher_dashboard",    chrome: "tab",    role: "ops",    title: "Centro de operaciones" },
    assign:   { file: "assignment_center",       chrome: "tab",    role: "ops",    title: "Asignaciones" },
    map:      { file: "operations_map",          chrome: "tab",    role: "ops",    title: "Mapa operativo" },
    fleet:    { file: "fleet_management",        chrome: "tab",    role: "ops",    title: "Gestión de flota" },
    drivers:  { file: "driver_management",       chrome: "tab",    role: "ops",    title: "Gestión de choferes" },
  };

  const NAVS = {
    user: [
      { route: "home",     icon: "home",            label: "Inicio" },
      { route: "services", icon: "event_note",      label: "Traslados" },
      { route: "request",  icon: "add_circle",      label: "Solicitar" },
      { route: "alerts",   icon: "notifications",   label: "Alertas", badge: true },
    ],
    driver: [
      { route: "driver",   icon: "dashboard",       label: "Panel" },
      { route: "active",   icon: "navigation",      label: "En curso" },
      { route: "alerts",   icon: "notifications",   label: "Alertas", badge: true },
    ],
    ops: [
      { route: "dispatch", icon: "space_dashboard", label: "Panel" },
      { route: "assign",   icon: "assignment",      label: "Asignar" },
      { route: "map",      icon: "map",             label: "Mapa" },
      { route: "fleet",    icon: "local_shipping",  label: "Flota" },
      { route: "drivers",  icon: "badge",           label: "Choferes" },
    ],
  };

  const ROLE_HOME = { user: "home", driver: "driver", ops: "dispatch" };
  const ROLE_LABEL = { user: "Usuario", driver: "Chofer", ops: "Operaciones" };
  // Tapping a list-row / card on these screens drills into a detail view.
  const DRILL = { home: "service", services: "service", driver: "active", dispatch: "assign" };

  const state = { role: "user", route: null, cache: new Map() };

  const view = document.getElementById("view");
  const nav = document.getElementById("nav");
  const navItems = document.getElementById("nav-items");
  const progress = document.getElementById("progress");
  const roleLabel = document.getElementById("role-label");

  /* ---------- routing ---------- */
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "").trim();
    return SCREENS[h] ? h : null;
  }
  function navigate(route, replace) {
    if (!SCREENS[route]) return;
    const target = "#/" + route;
    if (location.hash === target) { render(route); return; }
    if (replace) location.replace(target);
    else location.hash = target;
  }
  function back(meta) {
    if (history.length > 2) history.back();
    else navigate(meta.back || ROLE_HOME[state.role] || "home", true);
  }

  /* ---------- screen loading ---------- */
  async function fetchScreen(file) {
    if (state.cache.has(file)) return state.cache.get(file);
    const res = await fetch("screens/" + file + ".html", { cache: "no-cache" });
    const html = await res.text();
    state.cache.set(file, html);
    return html;
  }

  let loadToken = 0;
  async function render(route) {
    const meta = SCREENS[route];
    if (!meta) return navigate("splash", true);
    state.route = route;
    const token = ++loadToken;

    progress.classList.add("active");
    progress.style.width = "70%";

    let html;
    try {
      html = await fetchScreen(meta.file);
    } catch (e) {
      html = `<div class="screen-root" style="display:flex;align-items:center;justify-content:center;min-height:100dvh;text-align:center;padding:24px;">
        <div><p style="font-weight:600;color:#002863;">No se pudo cargar la pantalla.</p>
        <p style="color:#434651;font-size:14px;">Revisa tu conexión e inténtalo de nuevo.</p></div></div>`;
    }
    if (token !== loadToken) return; // a newer navigation superseded this one

    if (meta.role) state.role = meta.role;

    view.innerHTML = html;
    if (view.firstElementChild) view.firstElementChild.classList.add("screen-enter");

    document.body.setAttribute("data-chrome", meta.chrome);
    renderNav(route);
    window.scrollTo(0, 0);
    document.title = (meta.title ? meta.title + " · " : "") + "MT Empresarial";

    progress.style.width = "100%";
    setTimeout(() => { progress.classList.remove("active"); progress.style.width = "0"; }, 280);
  }

  function renderNav(route) {
    const items = NAVS[state.role] || NAVS.user;
    roleLabel.textContent = ROLE_LABEL[state.role] || "Usuario";
    navItems.innerHTML = "";
    for (const it of items) {
      const active = it.route === route;
      const btn = document.createElement("button");
      btn.className = "nav-item" + (active ? " active" : "");
      btn.type = "button";
      btn.setAttribute("data-route", it.route);
      btn.setAttribute("aria-current", active ? "page" : "false");
      btn.innerHTML =
        `<span class="ico-wrap"><span class="material-symbols-outlined">${it.icon}</span>` +
        `${it.badge ? '<span class="badge"></span>' : ""}</span>` +
        `<span class="label">${it.label}</span>`;
      navItems.appendChild(btn);
    }
  }

  /* ---------- click delegation inside screens & nav ---------- */
  function iconText(el) {
    const m = el.querySelector ? el.querySelector(".material-symbols-outlined") : null;
    return m ? m.textContent.trim() : "";
  }
  function hasIcon(el, name) {
    if (!el) return false;
    return [...el.querySelectorAll(".material-symbols-outlined")]
      .some((s) => s.textContent.trim() === name);
  }

  document.addEventListener("click", (e) => {
    // Nav items (also present in sidebar)
    const navBtn = e.target.closest("[data-route]");
    if (navBtn && (nav.contains(navBtn) || view.contains(navBtn))) {
      e.preventDefault();
      navigate(navBtn.getAttribute("data-route"));
      return;
    }

    if (!view.contains(e.target)) return;
    const route = state.route;
    const meta = SCREENS[route] || {};

    // Neutralise the Stitch placeholder anchors (href="#") so they don't
    // clobber the hash router.
    const anchor = e.target.closest("a");
    if (anchor) {
      const href = anchor.getAttribute("href") || "";
      if (href === "#" || href === "" || (href.startsWith("#") && !href.startsWith("#/"))) {
        e.preventDefault();
      }
    }

    const actionable = e.target.closest(
      "a,button,[role='button'],.role-card,[class*='card'],[class*='Card']"
    );

    // Splash: any tap advances to role selection.
    if (route === "splash") { e.preventDefault(); navigate("roles"); return; }

    // Role selection: pick a profile.
    if (route === "roles") {
      const card = e.target.closest(".role-card");
      const admin = e.target.closest("div");
      if (card) {
        e.preventDefault();
        const t = (card.textContent || "").toLowerCase();
        if (t.includes("chofer")) { state.role = "driver"; navigate("driver"); }
        else { state.role = "user"; navigate("home"); } // Usuario & Invitado
        return;
      }
      // "Acceso Administrativo" footer → operations.
      if (admin && /acceso administrativo/i.test(admin.textContent || "") &&
          (admin.textContent || "").length < 60) {
        e.preventDefault(); state.role = "ops"; navigate("dispatch"); return;
      }
    }

    if (!actionable) return;

    // Back affordances.
    if (hasIcon(actionable, "arrow_back") || hasIcon(actionable, "arrow_back_ios") ||
        hasIcon(actionable, "arrow_back_ios_new") || hasIcon(actionable, "close")) {
      e.preventDefault(); back(meta); return;
    }

    // "New / add" actions → request flow (user context).
    if (hasIcon(actionable, "add") || hasIcon(actionable, "add_circle") ||
        hasIcon(actionable, "add_road")) {
      e.preventDefault(); navigate("request"); return;
    }

    // Drill into a detail view when tapping a list row / card.
    if (DRILL[route]) {
      const looksRow = hasIcon(actionable, "chevron_right") ||
        /\bcard\b/i.test(actionable.className || "") ||
        actionable.matches("a,[role='button']");
      if (looksRow) { e.preventDefault(); navigate(DRILL[route]); return; }
    }
  });

  /* ---------- header controls ---------- */
  document.getElementById("switch-role").addEventListener("click", () => navigate("roles"));

  /* ---------- install (Add to Home Screen) ---------- */
  let deferredPrompt = null;
  const banner = document.getElementById("install-banner");
  const sideInstall = document.getElementById("install-btn-side");
  const standalone = window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  function showInstall() {
    if (standalone || sessionStorage.getItem("mt-install-dismissed")) return;
    banner.classList.add("show");
    sideInstall.classList.add("show");
  }
  function hideInstall() { banner.classList.remove("show"); sideInstall.classList.remove("show"); }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferredPrompt = e; showInstall();
  });
  async function doInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null; hideInstall();
  }
  document.getElementById("install-btn").addEventListener("click", doInstall);
  sideInstall.addEventListener("click", doInstall);
  document.getElementById("install-dismiss").addEventListener("click", () => {
    sessionStorage.setItem("mt-install-dismissed", "1"); hideInstall();
  });
  window.addEventListener("appinstalled", hideInstall);

  /* ---------- boot ---------- */
  window.addEventListener("hashchange", () => {
    const r = parseHash();
    if (r) render(r); else navigate("splash", true);
  });

  function boot() {
    const r = parseHash();
    if (r) render(r); else navigate("splash", true);
  }
  boot();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
