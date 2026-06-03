export type Role = "user" | "driver" | "ops" | "admin";

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: boolean;
}

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
    { href: "/app/alerts", icon: "notifications", label: "Alertas", badge: true },
  ],
  ops: [
    { href: "/ops", icon: "space_dashboard", label: "Dashboard" },
    { href: "/ops/assignments", icon: "assignment", label: "Asignar" },
    { href: "/ops/map", icon: "map", label: "Mapa" },
    { href: "/ops/fleet", icon: "local_shipping", label: "Flota" },
    { href: "/ops/drivers", icon: "badge", label: "Choferes" },
  ],
  admin: [
    { href: "/admin", icon: "shield_person", label: "Panel" },
    { href: "/admin/analytics", icon: "monitoring", label: "Analytics" },
    { href: "/admin/users", icon: "group", label: "Usuarios" },
    { href: "/admin/notifications", icon: "campaign", label: "Push" },
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
