import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { postId, authorName, authorAvatar, authorRole, text } = await req.json();

    const commentId = `comm-${Date.now()}`;
    await query(
      `
      INSERT INTO comments (id, post_id, author_name, author_avatar, author_role, text, timestamp, likes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
      `,
      [commentId, postId, authorName, authorAvatar, authorRole, text, "Just nu"]
    );

    return NextResponse.json({
      success: true,
      comment: {
        id: commentId,
        authorName,
        authorAvatar,
        authorRole,
        text,
        timestamp: "Just nu",
        likes: 0,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating comment:", error);
    const message = error instanceof Error ? error.message : "Error creating comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
