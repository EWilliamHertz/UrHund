import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { postId, increment } = await req.json();

    const change = increment ? 1 : -1;
    await query(
      `
      UPDATE posts 
      SET paw_count = GREATEST(0, paw_count + $1),
          likes = GREATEST(0, likes + $1)
      WHERE id = $2
      `,
      [change, postId]
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error updating likes:", error);
    const message = error instanceof Error ? error.message : "Error updating likes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
