export type Role = "user" | "driver" | "ops" | "admin";

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: boolean;
}

// Navs a 5 items máximo, operaciones al frente (estándar Vulcano v3).
export const NAV: Record<Role, NavItem[]> = {
  user: [
    { href: "/app", icon: "home", label: "Inicio" },
    { href: "/app/request", icon: "add_circle", label: "Solicitar" },
    { href: "/app/active", icon: "navigation", label: "En vivo" },
    { href: "/app/alerts", icon: "notifications", label: "Alertas", badge: true },
    { href: "/app/profile", icon: "person", label: "Perfil" },
  ],
  driver: [
    { href: "/driver", icon: "dashboard", label: "Panel" },
    { href: "/driver/map", icon: "map", label: "Mapa GPS" },
    { href: "/driver/documentos", icon: "badge", label: "Documentos" },
    { href: "/app/alerts", icon: "notifications", label: "Alertas", badge: true },
  ],
  ops: [
    { href: "/ops", icon: "space_dashboard", label: "Panel" },
    { href: "/ops/assignments", icon: "assignment", label: "Asignar" },
    { href: "/ops/map", icon: "map", label: "Mapa" },
    { href: "/ops/fleet", icon: "local_shipping", label: "Flota" },
    { href: "/ops/drivers", icon: "badge", label: "Choferes" },
  ],
  admin: [
    { href: "/admin", icon: "space_dashboard", label: "Panel" },
    { href: "/admin/traslados", icon: "directions_car", label: "Traslados" },
    { href: "/admin/drivers", icon: "local_taxi", label: "Choferes" },
    { href: "/admin/mapa", icon: "map", label: "Mapa" },
    { href: "/admin/settings", icon: "settings", label: "Ajustes" },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  user: "Usuario",
  driver: "Chofer",
  ops: "Operaciones",
  admin: "Administrador",
};

export const ROLE_HOME: Record<Role, string> = {
  user: "/app",
  driver: "/driver",
  ops: "/ops",
  admin: "/admin",
};

export const ROLE_RANK: Record<Role, number> = { user: 0, driver: 1, ops: 2, admin: 3 };

export const CAN_INVITE: Record<Role, Role[]> = {
  admin: ["admin", "ops", "driver", "user"],
  ops: ["driver", "user"],
  driver: ["user"],
  user: ["user"],
};
