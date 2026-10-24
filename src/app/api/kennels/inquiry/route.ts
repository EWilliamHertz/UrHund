import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      kennelId,
      kennelName,
      senderName,
      senderEmail,
      senderPhone,
      preferredBreed,
      experienceLevel,
      message,
    } = body;

    if (!kennelId || !senderName || !senderEmail || !message) {
      return NextResponse.json(
        { error: "Vänligen fyll i ditt namn, e-postadress och ditt meddelande." },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO kennel_inquiries (
        kennel_id,
        kennel_name,
        sender_name,
        sender_email,
        sender_phone,
        preferred_breed,
        experience_level,
        message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        kennelId,
        kennelName || "Okänd kennel",
        senderName,
        senderEmail,
        senderPhone || null,
        preferredBreed || null,
        experienceLevel || null,
        message,
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Tack! Din intresseanmälan har skickats till ${kennelName || "kenneln"}. Uppfödaren återkopplar via e-post eller telefon.`,
    });
  } catch (err: unknown) {
    console.error("Kennel inquiry error:", err);
    return NextResponse.json(
      { error: "Kunde inte skicka intresseanmälan. Försök igen om en stund." },
      { status: 500 }
    );
  }
}
