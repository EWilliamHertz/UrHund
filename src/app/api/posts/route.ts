import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      authorId,
      authorName,
      authorAvatar,
      authorRole,
      authorBadge,
      city,
      timestamp,
      postType,
      content,
      image,
      images,
      tags,
      likes,
      pawCount,
      targetBreedId,
      extraData,
    } = body;

    const newId = id || `post-${Date.now()}`;
    const finalImages = Array.isArray(images) && images.length > 0 ? images : image ? [image] : [];
    const primaryImage = finalImages[0] || image || null;

    await query(
      `
      INSERT INTO posts (
        id, author_id, author_name, author_avatar, author_role, author_badge,
        city, timestamp, post_type, content, image, images, tags, likes, paw_count,
        target_breed_id, extra_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `,
      [
        newId,
        authorId || "guest",
        authorName || "Anonym",
        authorAvatar || "",
        authorRole || "DOG_OWNER",
        authorBadge || null,
        city || "Sverige",
        timestamp || "Just nu",
        postType,
        content,
        primaryImage,
        JSON.stringify(finalImages),
        JSON.stringify(tags || []),
        likes || 0,
        pawCount || 0,
        targetBreedId || null,
        extraData ? JSON.stringify(extraData) : null,
      ]
    );

    return NextResponse.json({ success: true, id: newId });
  } catch (error: unknown) {
    console.error("Error creating post in database:", error);
    const message = error instanceof Error ? error.message : "Error creating post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Post-ID saknas" }, { status: 400 });
    }

    try {
      await query("DELETE FROM comments WHERE post_id = $1", [id]);
    } catch {}

    await query("DELETE FROM posts WHERE id = $1", [id]);

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    const message = error instanceof Error ? error.message : "Kunde inte radera inlägget";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, content, tags } = body;
    if (!id) {
      return NextResponse.json({ error: "Post-ID saknas" }, { status: 400 });
    }

    if (tags !== undefined) {
      await query("UPDATE posts SET content = $1, tags = $2 WHERE id = $3", [
        content,
        JSON.stringify(tags),
        id,
      ]);
    } else {
      await query("UPDATE posts SET content = $1 WHERE id = $2", [content, id]);
    }

    return NextResponse.json({ success: true, id, content });
  } catch (error: unknown) {
    console.error("Error editing post:", error);
    const message = error instanceof Error ? error.message : "Kunde inte redigera inlägget";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

