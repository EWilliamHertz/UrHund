import { NextResponse } from "next/server";
import { ALL_WORLD_BREEDS } from "@/data/allWorldBreeds";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  if (!q) {
    return NextResponse.json({ breeds: ALL_WORLD_BREEDS });
  }

  const filtered = ALL_WORLD_BREEDS.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q) ||
      b.origin.toLowerCase().includes(q) ||
      b.group.toLowerCase().includes(q)
  );

  return NextResponse.json({ breeds: filtered });
}
