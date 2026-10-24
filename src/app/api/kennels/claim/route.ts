import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kennelId, claimantName, claimantEmail, skkMemberNumber, message } = body;

    if (!kennelId || !claimantName || !claimantEmail) {
      return NextResponse.json(
        { error: "Vänligen fyll i kennel, ditt namn och din e-postadress." },
        { status: 400 }
      );
    }

    // Check if kennel exists
    const existing = await query("SELECT * FROM kennels WHERE id = $1", [kennelId]);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Kenneln kunde inte hittas i registret." },
        { status: 404 }
      );
    }

    // Update kennel to claimed
    await query(
      `UPDATE kennels 
       SET claimed = true, 
           claimed_by = $1, 
           contact_email = $2
       WHERE id = $3`,
      [claimantName, claimantEmail, kennelId]
    );

    return NextResponse.json({
      success: true,
      message: `Tack! Ditt anspråk på ${existing[0].name} har registrerats för ${claimantName} (${skkMemberNumber ? `SKK-nr: ${skkMemberNumber}` : claimantEmail}). Du kan nu hantera sidan.`,
      kennelId,
    });
  } catch (err: unknown) {
    console.error("Kennel claim error:", err);
    return NextResponse.json(
      { error: "Kunde inte slutföra anspråket. Försök igen om en stund." },
      { status: 500 }
    );
  }
}
