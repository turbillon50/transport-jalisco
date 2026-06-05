import { auth, currentUser } from "@clerk/nextjs/server";
import type { Role } from "./roles";

/** Lista de correos con acceso admin, desde la env ADMIN_EMAILS (separados por coma). */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Reads the active user's role from Clerk publicMetadata, defaulting to "user". */
export async function getRole(): Promise<Role> {
  try {
    const { sessionClaims } = await auth();
    const meta = (sessionClaims?.metadata as { role?: Role } | undefined)?.role;
    if (meta === "admin") return meta;

    const user = await currentUser();
    const role = (meta ?? (user?.publicMetadata?.role as Role | undefined)) ?? undefined;
    if (role === "admin") return "admin";

    // Acceso admin por correo (ADMIN_EMAILS), case-insensitive.
    const allow = adminEmails();
    if (allow.length) {
      const claimEmail = (sessionClaims as { email?: string } | undefined)?.email;
      const email = (claimEmail ?? user?.emailAddresses?.[0]?.emailAddress ?? "").trim().toLowerCase();
      if (email && allow.includes(email)) return "admin";
    }

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
