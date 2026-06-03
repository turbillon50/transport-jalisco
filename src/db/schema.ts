import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  numeric,
  doublePrecision,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "driver", "ops", "admin"]);
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "operativo",
  "mantenimiento",
  "inactivo",
]);
export const serviceStatusEnum = pgEnum("service_status", [
  "pendiente",
  "asignado",
  "confirmado",
  "en_curso",
  "completado",
  "cancelado",
]);
export const eventTypeEnum = pgEnum("event_type", [
  "created",
  "assigned",
  "driver_arrived",
  "started",
  "location_update",
  "completed",
  "cancelled",
  "alert",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default("user"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  plate: text("plate").notNull().unique(),
  model: text("model").notNull(),
  capacity: integer("capacity").notNull().default(4),
  status: vehicleStatusEnum("status").notNull().default("operativo"),
  imageUrl: text("image_url"),
  odometer: integer("odometer").default(0),
  driverId: uuid("driver_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  driverId: uuid("driver_id").references(() => users.id, { onDelete: "set null" }),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  originLat: doublePrecision("origin_lat"),
  originLng: doublePrecision("origin_lng"),
  destLat: doublePrecision("dest_lat"),
  destLng: doublePrecision("dest_lng"),
  passengers: integer("passengers").notNull().default(1),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  notes: text("notes"),
  status: serviceStatusEnum("status").notNull().default("pendiente"),
  price: numeric("price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceEvents = pgTable("service_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .references(() => services.id, { onDelete: "cascade" })
    .notNull(),
  type: eventTypeEnum("type").notNull(),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  note: text("note"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  icon: text("icon").default("notifications"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const featureFlags = pgTable("feature_flags", {
  key: text("key").primaryKey(),
  value: boolean("value").notNull().default(false),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: text("actor_id"),
  actorName: text("actor_name"),
  action: text("action").notNull(),
  target: text("target"),
  meta: text("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceEvent = typeof serviceEvents.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type AuditEntry = typeof auditLog.$inferSelect;
export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;
