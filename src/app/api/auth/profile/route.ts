import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const profile = await req.json();
    if (!profile.id) {
      return NextResponse.json({ error: "Profil-ID saknas" }, { status: 400 });
    }

    const allDogs = profile.dogs && profile.dogs.length > 0 ? profile.dogs : (profile.dog ? [profile.dog] : []);
    const primaryDog = allDogs[0] || profile.dog || null;

    await query(
      `
      UPDATE user_profiles
      SET name = $1,
          avatar = $2,
          location = $3,
          city = $4,
          bio = $5,
          dog = $6,
          dogs = $7,
          prospective_info = $8,
          kennel = $9,
          role = COALESCE($10, role),
          registry = COALESCE($11, registry)
      WHERE id = $12
      `,
      [
        profile.name,
        profile.avatar || "",
        profile.location || profile.city || "Sverige",
        profile.city || "Stockholm",
        profile.bio || "",
        primaryDog ? JSON.stringify(primaryDog) : null,
        JSON.stringify(allDogs),
        profile.prospectiveInfo ? JSON.stringify(profile.prospectiveInfo) : null,
        profile.kennel ? JSON.stringify(profile.kennel) : null,
        profile.role || null,
        profile.registry || null,
        profile.id,
      ]
    );

    return NextResponse.json({ success: true, profile });
  } catch (error: unknown) {
    console.error("Profile update error:", error);
    const message = error instanceof Error ? error.message : "Kunde inte uppdatera profilen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json({ error: "ID eller e-post krävs" }, { status: 400 });
    }

    const rows = id
      ? await query("SELECT * FROM user_profiles WHERE id = $1 LIMIT 1", [id])
      : await query("SELECT * FROM user_profiles WHERE email = $1 LIMIT 1", [
          email!.toLowerCase().trim(),
        ]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Användaren hittades inte" }, { status: 404 });
    }

    const u = rows[0];
    const profile = {
      id: u.id,
      name: u.name,
      role: u.role,
      email: u.email,
      avatar: u.avatar || "",
      location: u.location || "Sverige",
      city: u.city || "Stockholm",
      bio: u.bio || "",
      verified: u.verified ?? true,
      registry: u.registry || "SKK (Sverige)",
      dog: u.dog,
      dogs: u.dogs || [],
      prospectiveInfo: u.prospective_info,
      kennel: u.kennel,
      createdAt: u.created_at,
    };

    return NextResponse.json({ success: true, profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Kunde inte hämta profilen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

