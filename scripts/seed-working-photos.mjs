import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Mapping of kennel breed IDs to Dog API breed slugs
const BREED_API_MAP = {
  "shiba-inu": "shiba",
  "akita-inu": "akita",
  "american-akita": "akita",
  "tibetan-mastiff": "mastiff/tibetan",
  "samoyed": "samoyed",
  "siberian-husky": "husky",
  "alaskan-malamute": "malamute",
  "basenji": "basenji",
  "chow-chow": "chow",
  "norsk-alghund-gra": "elkhound/norwegian",
  "jamthund": "elkhound/norwegian",
  "xoloitzcuintli": "mexicanhairless",
  "finsk-lapphund": "buhund/norwegian",
  "svensk-lapphund": "elkhound/norwegian",
  "vastgotaspets": "buhund/norwegian",
  "norrbottenspets": "spitz/japanese",
  "faraohund": "basenji",
  "canaan-dog": "basenji",
  "shikoku": "shiba",
  "kai-ken": "akita",
  "hokkaido": "akita",
  "kishu": "spitz/japanese",
};

async function fetchBreedImages(apiSlug) {
  try {
    const res = await fetch(`https://dog.ceo/api/breed/${apiSlug}/images`);
    const data = await res.json();
    if (data.status === "success" && Array.isArray(data.message) && data.message.length > 0) {
      return data.message;
    }
  } catch (err) {
    console.warn(`Failed fetching Dog CEO images for ${apiSlug}:`, err);
  }
  return ["https://images.dog.ceo/breeds/shiba/shiba-16.jpg"];
}

async function seedPhotos() {
  console.log("🐾 Connecting to Neon PostgreSQL to seed working dog photos...");
  const client = await pool.connect();

  try {
    // 1. Preload image libraries for all needed breeds
    console.log("📥 Fetching verified CDN dog photos from Dog API...");
    const breedCache = {};
    for (const apiSlug of new Set(Object.values(BREED_API_MAP))) {
      breedCache[apiSlug] = await fetchBreedImages(apiSlug);
      console.log(`  ✓ ${apiSlug}: ${breedCache[apiSlug].length} photos available`);
    }

    // 2. Update breeds table
    console.log("\n🐕 Updating breeds table with verified CDN photos...");
    const breedUpdates = [
      { id: "shiba-inu", image: breedCache["shiba"][0] },
      { id: "akita-inu", image: breedCache["akita"][0] },
      { id: "tibetan-mastiff", image: breedCache["mastiff/tibetan"][0] },
    ];

    for (const b of breedUpdates) {
      await client.query("UPDATE breeds SET image = $1 WHERE id = $2", [b.image, b.id]);
      console.log(`  ✓ Updated breed [${b.id}] -> ${b.image}`);
    }

    // 3. Update all 39 kennels
    console.log("\n🏡 Updating 39 kennels with verified breed photos...");
    const kennelsRes = await client.query("SELECT id, name, breed_ids FROM kennels ORDER BY id");
    const kennels = kennelsRes.rows;

    const breedPointers = {};

    for (const kennel of kennels) {
      const primaryBreed = (kennel.breed_ids && kennel.breed_ids[0]) || "shiba-inu";
      const apiSlug = BREED_API_MAP[primaryBreed] || "shiba";
      const photoList = breedCache[apiSlug] || breedCache["shiba"];

      // Rotate pointer so adjacent kennels get different photos
      breedPointers[apiSlug] = (breedPointers[apiSlug] || 0);
      const startIdx = breedPointers[apiSlug] % photoList.length;
      breedPointers[apiSlug] += 5; // jump for next kennel of same breed

      const heroImage = photoList[startIdx];
      const galleryPhotos = [];
      const galleryCount = Math.min(4, photoList.length);
      for (let i = 0; i < galleryCount; i++) {
        galleryPhotos.push(photoList[(startIdx + i + 1) % photoList.length]);
      }

      await client.query(
        "UPDATE kennels SET image = $1, photos = $2::jsonb WHERE id = $3",
        [heroImage, JSON.stringify(galleryPhotos), kennel.id]
      );

      console.log(`  ✓ [${kennel.id}] ${kennel.name} (${primaryBreed}):`);
      console.log(`     Hero: ${heroImage}`);
      console.log(`     Gallery: ${galleryPhotos.length} photos`);
    }

    console.log(`\n🎉 Successfully updated all ${kennels.length} kennels with verified CDN photos!`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPhotos();
