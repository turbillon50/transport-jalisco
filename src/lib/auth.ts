import { auth, currentUser } from "@clerk/nextjs/server";
import type { Role } from "./roles";

/** Reads the active user's role from Clerk publicMetadata, defaulting to "user". */
export async function getRole(): Promise<Role> {
  try {
    const { sessionClaims } = await auth();
    const meta = (sessionClaims?.metadata as { role?: Role } | undefined)?.role;
    if (meta) return meta;
    const user = await currentUser();
    const role = user?.publicMetadata?.role as Role | undefined;
    return role ?? "user";
  } catch {
    return "user";
  }
}

export async function getProfile() {
  try {
    const user = await currentUser();
    if (!user) return { name: "Invitado", email: "", avatar: null as string | null };
    return {
      name: user.firstName ?? user.username ?? "Usuario",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      avatar: user.imageUrl ?? null,
    };
  } catch {
    return { name: "Invitado", email: "", avatar: null as string | null };
  }
}
