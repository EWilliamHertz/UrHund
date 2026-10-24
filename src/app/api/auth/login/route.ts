import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vänligen ange både e-post och lösenord." },
        { status: 400 }
      );
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const users = await query(
      "SELECT * FROM user_profiles WHERE email = $1 AND password = $2",
      [email.toLowerCase().trim(), passwordHash]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Felaktig e-postadress eller lösenord. Kontrollera dina uppgifter." },
        { status: 401 }
      );
    }

    const user = users[0];
    const allDogs = (user.dogs && Array.isArray(user.dogs) && user.dogs.length > 0)
      ? user.dogs
      : (user.dog ? [user.dog] : []);

    const profile = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      location: user.location,
      city: user.city,
      bio: user.bio,
      verified: user.verified,
      createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
      registry: user.registry,
      dog: allDogs[0] || user.dog || undefined,
      dogs: allDogs,
      prospectiveInfo: user.prospective_info || undefined,
      kennel: user.kennel || undefined,
    };

    return NextResponse.json({ success: true, profile });
  } catch (error: unknown) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Inloggningen misslyckades.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
