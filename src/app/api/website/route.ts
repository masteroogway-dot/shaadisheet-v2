import { NextRequest, NextResponse } from "next/server";
import { getWeddingBySlug } from "@/lib/actions";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

  const wedding = await getWeddingBySlug(slug);
  if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

  return NextResponse.json({ wedding });
}
