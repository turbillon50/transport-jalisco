import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function POST(request: Request): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") ?? `upload-${Date.now()}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN no configurado" }, { status: 501 });
  }
  if (!request.body) {
    return NextResponse.json({ error: "Cuerpo vacío" }, { status: 400 });
  }

  const blob = await put(`mt-empresarial/${filename}`, request.body, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json(blob);
}
