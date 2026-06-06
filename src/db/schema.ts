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

export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
  "tarjeta",
  "efectivo",
  "transferencia",
  "empresarial",
]);

export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: paymentMethodTypeEnum("type").notNull(),
  label: text("label").notNull(),
  brand: text("brand"),
  last4: text("last4"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }),
  raterId: uuid("rater_id").references(() => users.id, { onDelete: "set null" }),
  rateeId: uuid("ratee_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stars: integer("stars").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  role: roleEnum("role").notNull(),
  label: text("label"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdByName: text("created_by_name"),
  createdByRole: roleEnum("created_by_role"),
  usedBy: uuid("used_by").references(() => users.id, { onDelete: "set null" }),
  usedAt: timestamp("used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
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
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .references(() => services.id, { onDelete: "cascade" })
    .notNull(),
  fromUser: uuid("from_user").references(() => users.id, { onDelete: "set null" }),
  fromName: text("from_name"),
  fromRole: roleEnum("from_role").notNull(),
  toRole: roleEnum("to_role"),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;

export const docKindEnum = pgEnum("doc_kind", [
  "foto_chofer",
  "foto_unidad",
  "licencia",
  "tarjeta_circulacion",
  "otro",
]);
export const docStatusEnum = pgEnum("doc_status", ["pendiente", "aprobado", "rechazado"]);

export const driverDocuments = pgTable("driver_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  driverId: uuid("driver_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  kind: docKindEnum("kind").notNull(),
  url: text("url").notNull(),
  fileName: text("file_name"),
  status: docStatusEnum("status").notNull().default("pendiente"),
  note: text("note"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DriverDocument = typeof driverDocuments.$inferSelect;
