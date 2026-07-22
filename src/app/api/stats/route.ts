import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const weddingCount = await prisma.wedding.count();
    return NextResponse.json({ count: weddingCount });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
