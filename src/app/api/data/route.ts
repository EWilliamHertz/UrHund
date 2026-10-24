import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const breeds = await query("SELECT * FROM breeds ORDER BY name ASC");
    const kennels = await query("SELECT * FROM kennels ORDER BY name ASC");
    const dogMates = await query("SELECT * FROM dog_mates ORDER BY distance_km ASC");
    const dogSitters = await query("SELECT * FROM dog_sitters ORDER BY rating DESC");

    // Fetch posts with their comments
    const posts = await query(`
      SELECT 
        p.id,
        p.author_id as "authorId",
        p.author_name as "authorName",
        p.author_avatar as "authorAvatar",
        p.author_role as "authorRole",
        p.author_badge as "authorBadge",
        p.city,
        p.timestamp,
        p.post_type as "postType",
        p.content,
        p.image,
        COALESCE(p.images, '[]'::jsonb) as "images",
        p.tags,
        p.likes,
        p.paw_count as "pawCount",
        p.target_breed_id as "targetBreedId",
        p.extra_data as "extraData",
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'authorName', c.author_name,
              'authorAvatar', c.author_avatar,
              'authorRole', c.author_role,
              'text', c.text,
              'timestamp', c.timestamp,
              'likes', c.likes
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) as comments
      FROM posts p
      LEFT JOIN comments c ON c.post_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    // Format Breeds into frontend structure
    const formattedBreeds = breeds.map((b) => ({
      id: b.id,
      name: b.name,
      nativeName: b.native_name,
      origin: b.origin,
      fciGroup: b.fci_group,
      tagline: b.tagline,
      description: b.description,
      image: b.image,
      stats: b.stats,
      traits: b.traits,
      coatColors: b.coat_colors,
      healthChecks: b.health_checks,
    }));

    // Format Kennels
    const formattedKennels = kennels.map((k) => ({
      id: k.id,
      name: k.name,
      breedIds: k.breed_ids,
      country: k.country,
      city: k.city,
      registry: k.registry,
      verifiedHealthTests: k.verified_health_tests,
      planningLitter: k.planning_litter,
      nextLitterEstimate: k.next_litter_estimate,
      website: k.website,
      kopahundUrl: k.kopahund_url || null,
      clubUrl: k.club_url || null,
      phone: k.phone || null,
      litters: k.litters || [],
      claimed: k.claimed ?? false,
      claimedBy: k.claimed_by || null,
      contactEmail: k.contact_email || null,
      description: k.description || "",
      image: k.image || null,
      photos: k.photos || [],
    }));

    // Format Dog Mates
    const formattedDogMates = dogMates.map((m) => ({
      id: m.id,
      dogName: m.dog_name,
      registeredName: m.registered_name,
      breedId: m.breed_id,
      breedName: m.breed_name,
      age: m.age,
      gender: m.gender,
      ownerName: m.owner_name,
      ownerAvatar: m.owner_avatar,
      city: m.city,
      area: m.area,
      image: m.image,
      energyLevel: m.energy_level,
      friendlyWith: m.friendly_with,
      about: m.about,
      distanceKm: Number(m.distance_km),
    }));

    // Format Dog Sitters
    const formattedDogSitters = dogSitters.map((s) => ({
      id: s.id,
      name: s.name,
      avatar: s.avatar,
      city: s.city,
      area: s.area,
      ratePerDaySEK: s.rate_per_day_sek,
      rating: Number(s.rating),
      reviewsCount: s.reviews_count,
      verifiedId: s.verified_id,
      experienceYears: s.experience_years,
      homeType: s.home_type,
      acceptsBreeds: s.accepts_breeds,
      bio: s.bio,
      badge: s.badge,
    }));

    return NextResponse.json({
      breeds: formattedBreeds,
      kennels: formattedKennels,
      posts,
      dogMates: formattedDogMates,
      dogSitters: formattedDogSitters,
    });
  } catch (error: unknown) {
    console.error("Database fetch error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch data from database";
    return NextResponse.json(
      { error: "Failed to fetch data from database", details: message },
      { status: 500 }
    );
  }
}
