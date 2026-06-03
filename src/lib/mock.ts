/**
 * Deterministic seed data mirroring the Google Stitch design exactly.
 * Server components render from the DB when available and fall back to this,
 * guaranteeing a faithful UI and a green build without DB connectivity.
 */
export type ServiceStatus =
  | "pendiente"
  | "asignado"
  | "confirmado"
  | "en_curso"
  | "completado"
  | "cancelado";

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  pendiente: "Pendiente",
  asignado: "Asignado",
  confirmado: "Confirmado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

export interface MockService {
  id: string;
  day: string;
  month: string;
  time: string;
  origin: string;
  destination: string;
  status: ServiceStatus;
  passengers: number;
  passenger: string;
  driver: string;
  vehicle: string;
  plate: string;
}

export const services: MockService[] = [
  { id: "9001", day: "24", month: "MAY", time: "08:00 AM", origin: "Aeropuerto GDL", destination: "Hotel Riu Plaza", status: "confirmado", passengers: 1, passenger: "María González", driver: "Carlos Hernández", vehicle: "Toyota Hiace 2023", plate: "JAL-12-AB" },
  { id: "9002", day: "25", month: "MAY", time: "09:30 AM", origin: "Hotel Hilton", destination: "Centro Expo GDL", status: "asignado", passengers: 1, passenger: "José Martínez", driver: "Luis Ramírez", vehicle: "Mercedes Sprinter", plate: "GTO-45-XY" },
  { id: "9003", day: "27", month: "MAY", time: "07:00 AM", origin: "Domicilio Particular", destination: "Aeropuerto GDL", status: "pendiente", passengers: 2, passenger: "Ana López", driver: "—", vehicle: "—", plate: "—" },
  { id: "9004", day: "30", month: "MAY", time: "06:00 PM", origin: "Restaurante La Tequila", destination: "Hotel Camino Real", status: "pendiente", passengers: 3, passenger: "Roberto Díaz", driver: "—", vehicle: "—", plate: "—" },
];

export interface MockVehicle {
  id: string;
  model: string;
  plate: string;
  capacity: number;
  status: "operativo" | "mantenimiento" | "inactivo";
  detail: string;
  odometer: string;
  image: string;
}

export const vehicles: MockVehicle[] = [
  { id: "v1", model: "Toyota Hiace 2023", plate: "JAL-12-AB", capacity: 14, status: "operativo", detail: "Último Manto: 12 Mayo, 2024", odometer: "12,450 km", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfIRul7TYomlXW9EW1eNm68Yagpjkd12Bz-GXod4MzIaA2UjaaGyDTTsBoW0SbrJXFMkxPiYeBxXRrPK7euUy9IvQQ70QqK6g4ub3Hy4gtt4i9BVur_Dn-sUhcc-VLeTODeVysN509-bYHWMdCY2eFvRnYI_90EhIMt5sahms2g040COoxGEtO6o292zi8PqBkzuf6URgu5UralbMR_W9CS1BeEQVobHBCx69uf5v3618s14VvdwYoO9jSEbXTXWe2qosaNxT_vxA" },
  { id: "v2", model: "Mercedes Sprinter", plate: "GTO-45-XY", capacity: 18, status: "mantenimiento", detail: "En Taller: Preventivo", odometer: "Entrega est.: 28 Mayo", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZOSDSazzzFmeK38sU1hfzJcPJEoyqFsdLuRIJSsaLfrRk9fUPrZMRu5YjTH8WDYX_4EPEBi31IuMftG2BE_YsHeF0BRd4S-9F75bqMc-IFezqmNY-W7Q8dQRGEivUtC7yn650sAsyO3NsyxcPmRYo4-tjuC8mnN6rARYYhTttJi0o7qsE1_mc7bayHVZrQX5jDLRCqCHzlJ__hil0yZn1WZjl7f5W9XxPWEuBCW0aWZMAu8cWRiQEL1FmBDc4ewxAwFz6W_cRlQI" },
  { id: "v3", model: "Nissan Urvan", plate: "JAL-88-ZZ", capacity: 14, status: "operativo", detail: "Último Manto: 05 Mayo, 2024", odometer: "Ubicación: Guadalajara", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNoz_jt_sP1NpSO3P1HqStIfOBuxtm1T03_sU7bfRLIPo2VEV4UjatsMTjxl3QQ4eGjb5f76bk6xr9PA_gGhj7wQGj0aieaJ8TyjTmIoM5O6_KqZWSvLoTudPulJ3-0OX7mQS4EUvsjwCN2XIoqqKSlHaFLx-xrkWFaKDy_LJqTQIfZK8Vf865RjzzezlfG5mWGtiywRvGfaZMxTJ3aXsVRblvnFAPmcnBwEVmaijwWIjtjbmuT4uwbC48YoEq8DsafQqBa6BxqsA" },
];

export interface MockDriver {
  id: string;
  name: string;
  rating: number;
  status: "En ruta" | "Disponible" | "Descanso" | "En servicio";
  docs: string;
  vehicle: string;
  avatar: string;
}

export const drivers: MockDriver[] = [
  { id: "d1", name: "Carlos Hernández", rating: 4.9, status: "En ruta", docs: "Al día", vehicle: "Toyota Hiace 2023", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfyGPxjvSElKyjVvHQ0buhq_UwjlkXG8irVxp79OFwNr7KAZz9q1AnF_jl0SImMS53e36JO9Whmgw47e5zTFFxJfGedOQPUZhujIZGGUqCqw4VHV8X9yBr3ooAbg2vBh3QYUsYMCpHdIxHIhQl8cZhPQRX-fKr73leVj1ci5CZhhDG1VCTQRbBNrcgNw9hqSzPLGV1rpo_XsnYtPJaSklD0l-bLvA5OTOlzFPeYIRWmPjnM9CSWtb5dEgafNrd9EXGlSq5PxqVMTk" },
  { id: "d2", name: "Luis Ramírez", rating: 4.7, status: "Disponible", docs: "Próx. Vencimiento", vehicle: "N/A", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoFysejAoa0Dc02z7rnDMzFNUbFmMz6bqUrpnJGqPIXjk5Jpl-bBWcxdhRi6JXib0yfNGEuw6w0C3adjPnXNiRev03ImKTjI9oqXLzZ2NO3yu0WulBL4UI8vHw4H0MVbdYTx9j9vkpik6riYN8ZQxDoR6kOE3fKZ56tqQxGhtxz6Ljo5n2N4Kjg_UYQGhLksTl1derxYtO5R7jj9tJWTZgQ8ysf2mjpUTXOUXxAEqCMJQ_bMgXrXIigSDdomQ0XaVmojNlitR6FeI" },
  { id: "d3", name: "Miguel Torres", rating: 4.8, status: "Descanso", docs: "Al día", vehicle: "Suburban 2022", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDr1fSCNEu_THUeJjHnSTj3H6hjqJJUp4-qYdbrIcX8GV09bgbFM4z599ry-IcxfsM1geHRKKchke_8_0wPbluIkR4Smn6yNgbxDQT4QAjoiVcKm39WATfP5DShiOCxrqClrE7_bCMR7ty8sTEOu9TiKcTfxcJKl_TwycbPTbXOqTsu_Fg-bSn5ZpwKPxjSBhUypSQEy2wRUK_W6uP3n4yTvgMmoG5TC1pbcoc0k1PriLkdS-NSrv-4P3MtnBMESmbkBCkEitSrCw" },
];

export interface MockNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  time: string;
  tone: "primary" | "secondary" | "error" | "muted";
  unread: boolean;
}

export const notifications: MockNotification[] = [
  { id: "n1", title: "Llegada", body: "Tu chofer ha llegado al punto de origen.", icon: "location_on", time: "Justo ahora", tone: "primary", unread: true },
  { id: "n2", title: "Chofer Asignado", body: "Carlos Hernández ha sido asignado a tu servicio de las 08:00 AM.", icon: "person_pin", time: "hace 2 min", tone: "secondary", unread: true },
  { id: "n3", title: "Vehículo Asignado", body: "Toyota Hiace (JAL-12-AB) asignado para tu servicio.", icon: "directions_car", time: "hace 5 min", tone: "secondary", unread: true },
  { id: "n4", title: "Retraso Reportado", body: "El chofer reporta un retraso de 10 min por tráfico intenso en Av. Vallarta.", icon: "warning", time: "hace 15 min", tone: "error", unread: true },
  { id: "n5", title: "Servicio Completado", body: "Gracias por viajar con MT Empresarial. Tu trayecto ha finalizado con éxito.", icon: "check_circle", time: "Ayer", tone: "muted", unread: false },
];

export const fleetStats = { total: 42, enServicio: 38, mantenimiento: 3, inactivos: 1 };
export const dispatchStats = { hoy: 32, enCurso: 18, pendientes: 7, choferes: 23 };
export const driverStats = { total: 48, enRuta: 18, disponibles: 23, docsVencidos: 2 };

// Analytics seed for superadmin (recharts)
export const analyticsServices = [
  { day: "Lun", servicios: 28, ingresos: 14200 },
  { day: "Mar", servicios: 35, ingresos: 18900 },
  { day: "Mié", servicios: 31, ingresos: 16100 },
  { day: "Jue", servicios: 42, ingresos: 22400 },
  { day: "Vie", servicios: 48, ingresos: 27600 },
  { day: "Sáb", servicios: 39, ingresos: 20800 },
  { day: "Dom", servicios: 22, ingresos: 11300 },
];

export const serviceTypeBreakdown = [
  { name: "Aeropuerto", value: 42, color: "#002863" },
  { name: "Corporativo", value: 28, color: "#1e6bff" },
  { name: "Eventos", value: 18, color: "#00b4d8" },
  { name: "Otros", value: 12, color: "#f7bd3d" },
];

export const adminUsers = [
  { id: "u1", name: "María González", email: "maria@empresa.com", role: "user", joined: "12 Mar 2024" },
  { id: "u2", name: "Carlos Hernández", email: "carlos.h@mtempresarial.com", role: "driver", joined: "03 Ene 2024" },
  { id: "u3", name: "Luis Ramírez", email: "luis.r@mtempresarial.com", role: "driver", joined: "21 Feb 2024" },
  { id: "u4", name: "Sofía Operaciones", email: "ops@mtempresarial.com", role: "ops", joined: "08 Dic 2023" },
  { id: "u5", name: "Admin Root", email: "admin@mtempresarial.com", role: "admin", joined: "01 Nov 2023" },
];

export const featureFlagsSeed = [
  { key: "live_tracking", value: true, description: "Rastreo GPS en vivo para usuarios" },
  { key: "push_campaigns", value: true, description: "Campañas de notificaciones push" },
  { key: "driver_self_assign", value: false, description: "Choferes pueden auto-asignarse servicios" },
  { key: "surge_pricing", value: false, description: "Tarifa dinámica por demanda" },
  { key: "blob_uploads", value: true, description: "Subida de imágenes a Vercel Blob" },
];

export const auditSeed = [
  { id: "a1", actor: "Admin Root", action: "Cambió rol de usuario", target: "luis.r@ → ops", time: "hace 5 min" },
  { id: "a2", actor: "Sofía Operaciones", action: "Asignó servicio #9002", target: "Luis Ramírez", time: "hace 18 min" },
  { id: "a3", actor: "Admin Root", action: "Activó feature flag", target: "live_tracking", time: "hace 1 h" },
  { id: "a4", actor: "Sofía Operaciones", action: "Registró vehículo", target: "Nissan Urvan JAL-88-ZZ", time: "hace 3 h" },
];

// Guadalajara coordinates for Mapbox
export const GDL_CENTER: [number, number] = [-103.3496, 20.6597];
export const fleetMarkers = [
  { id: "m1", lng: -103.36, lat: 20.67, type: "vehicle" as const, label: "JAL-12-AB" },
  { id: "m2", lng: -103.33, lat: 20.65, type: "vehicle" as const, label: "GTO-45-XY" },
  { id: "m3", lng: -103.38, lat: 20.64, type: "incident" as const, label: "Incidencia" },
  { id: "m4", lng: -103.31, lat: 20.68, type: "destination" as const, label: "3" },
];
