import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      role,
      city,
      location,
      bio,
      avatar,
      registry,
      dog,
      dogs,
      prospectiveInfo,
      kennel,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Namn, e-post och lösenord krävs för registrering." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await query("SELECT id FROM user_profiles WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Det finns redan ett konto registrerat med denna e-postadress." },
        { status: 409 }
      );
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    const userAvatar =
      avatar ||
      (role === "BREEDER"
        ? "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80"
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80");

    const allDogs = dogs && dogs.length > 0 ? dogs : (dog ? [dog] : []);
    const primaryDog = allDogs[0] || dog || null;

    await query(
      `
      INSERT INTO user_profiles (
        id, role, name, email, password, avatar, location, city, bio,
        verified, registry, dog, dogs, prospective_info, kennel, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11, $12, $13, $14, NOW())
      `,
      [
        userId,
        role,
        name,
        email.toLowerCase().trim(),
        passwordHash,
        userAvatar,
        location || city || "Sverige",
        city || "Stockholm",
        bio || (role === "BREEDER" ? "Verifierad uppfödare" : role === "SEEKING_DOG" ? "Söker framtida hund" : "Aktiv hundägare"),
        registry || (role === "BREEDER" ? "SKK (Sverige)" : null),
        primaryDog ? JSON.stringify(primaryDog) : null,
        JSON.stringify(allDogs),
        prospectiveInfo ? JSON.stringify(prospectiveInfo) : null,
        kennel ? JSON.stringify(kennel) : null,
      ]
    );

    const userProfile = {
      id: userId,
      role,
      name,
      email: email.toLowerCase().trim(),
      avatar: userAvatar,
      location: location || city || "Sverige",
      city: city || "Stockholm",
      bio: bio || (role === "BREEDER" ? "Verifierad uppfödare" : role === "SEEKING_DOG" ? "Söker framtida hund" : "Aktiv hundägare"),
      verified: true,
      createdAt: new Date().toISOString(),
      registry: registry || (role === "BREEDER" ? "SKK (Sverige)" : undefined),
      dog: primaryDog || undefined,
      dogs: allDogs,
      prospectiveInfo: prospectiveInfo || undefined,
      kennel: kennel || undefined,
    };

    return NextResponse.json({ success: true, profile: userProfile });
  } catch (error: unknown) {
    console.error("Register error:", error);
    const message = error instanceof Error ? error.message : "Registreringen misslyckades.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
