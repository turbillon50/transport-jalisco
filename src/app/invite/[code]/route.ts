import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { invitations } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = (params.code ?? "").trim().toUpperCase();
  const origin = req.nextUrl.origin;
  const bad = NextResponse.redirect(new URL("/invitacion?error=1", origin), 302);

  if (!code || !hasDb) return bad;

  try {
    const [inv] = await db.select().from(invitations).where(eq(invitations.code, code)).limit(1);
    const expired = inv?.expiresAt ? new Date(inv.expiresAt).getTime() < Date.now() : false;
    if (!inv || !inv.active || inv.usedBy || expired) return bad;

    const res = NextResponse.redirect(new URL(`/invitacion/${code}`, origin), 302);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return bad;
  }
}
