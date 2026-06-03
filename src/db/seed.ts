import { config } from "dotenv";
config({ path: ".env.local" });

import { db, hasDb } from "./index";
import { featureFlags, users, vehicles } from "./schema";
import * as mock from "../lib/mock";

async function main() {
  if (!hasDb) {
    console.log("DATABASE_URL no configurada — nada que sembrar.");
    return;
  }

  console.log("Sembrando feature flags…");
  for (const f of mock.featureFlagsSeed) {
    await db
      .insert(featureFlags)
      .values({ key: f.key, value: f.value, description: f.description })
      .onConflictDoUpdate({ target: featureFlags.key, set: { value: f.value, description: f.description } });
  }

  console.log("Sembrando usuarios demo…");
  for (const u of mock.adminUsers) {
    await db
      .insert(users)
      .values({ name: u.name, email: u.email, role: u.role as "user" | "driver" | "ops" | "admin" })
      .onConflictDoNothing();
  }

  console.log("Sembrando vehículos…");
  for (const v of mock.vehicles) {
    await db
      .insert(vehicles)
      .values({ plate: v.plate, model: v.model, capacity: v.capacity, status: v.status, imageUrl: v.image })
      .onConflictDoNothing();
  }

  console.log("✅ Seed completo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
