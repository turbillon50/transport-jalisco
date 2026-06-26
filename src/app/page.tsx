import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db, hasDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { HomePublic } from "@/components/home-public";

async function getUserRole(clerkId: string): Promise<string | null> {
  if (!hasDb) return null;
  try {
    const [u] = await db.select({ role: users.role }).from(users).where(eq(users.clerkId, clerkId)).limit(1);
    return u?.role ?? null;
  } catch { return null; }
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    const role = await getUserRole(userId);
    if (role === "admin") redirect("/admin");
    if (role === "driver") redirect("/driver");
    if (role === "ops") redirect("/ops");
    if (role === "user") redirect("/app");
    redirect("/role");
  }
  return <HomePublic />;
}
