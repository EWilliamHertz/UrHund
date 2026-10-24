import { put } from "@vercel/blob";
import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const token = process.env.BLOB_READ_WRITE_TOKEN;

async function migrateToVercelBlob() {
  console.log("☁️  Checking Vercel Blob configuration...");

  if (!token) {
    console.error(`
❌ BLOB_READ_WRITE_TOKEN saknas i miljön.

För att använda Vercel Blob för bildlagring:
1. Gå till https://vercel.com/dashboard
2. Välj ditt projekt > Storage > Create Database > Blob
3. Skapa ett Blob-store och kopiera token (BLOB_READ_WRITE_TOKEN)
4. Lägg till den i .env.local:
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
5. Kör detta skript igen:
   node --env-file=.env.local scripts/migrate-to-vercel-blob.mjs
`);
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log("🐾 Ansluten till PostgreSQL. Startar migrering till Vercel Blob...");

    // 1. Migrate Breeds
    const breedsRes = await client.query("SELECT id, name, image FROM breeds");
    console.log(`\n🐕 Migrerar ${breedsRes.rows.length} raser till Vercel Blob...`);

    for (const breed of breedsRes.rows) {
      if (breed.image && !breed.image.includes("vercel-storage.com")) {
        try {
          console.log(`  Laddar upp ras [${breed.name}]...`);
          const imgRes = await fetch(breed.image);
          if (imgRes.ok) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            const blob = await put(`urhund/breeds/${breed.id}.jpg`, buffer, {
              access: "public",
              contentType: imgRes.headers.get("content-type") || "image/jpeg",
              token,
            });
            await client.query("UPDATE breeds SET image = $1 WHERE id = $2", [blob.url, breed.id]);
            console.log(`  ✓ ${breed.name} -> ${blob.url}`);
          }
        } catch (err) {
          console.warn(`  ⚠️ Fel vid uppladdning för ras ${breed.id}:`, err.message);
        }
      }
    }

    // 2. Migrate Kennels
    const kennelsRes = await client.query("SELECT id, name, image, photos FROM kennels ORDER BY id");
    console.log(`\n🏡 Migrerar ${kennelsRes.rows.length} kennlar till Vercel Blob...`);

    for (const kennel of kennelsRes.rows) {
      let updatedHero = kennel.image;
      const updatedPhotos = [];

      // Hero image
      if (kennel.image && !kennel.image.includes("vercel-storage.com")) {
        try {
          const imgRes = await fetch(kennel.image);
          if (imgRes.ok) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            const blob = await put(`urhund/kennels/${kennel.id}-hero.jpg`, buffer, {
              access: "public",
              contentType: imgRes.headers.get("content-type") || "image/jpeg",
              token,
            });
            updatedHero = blob.url;
          }
        } catch (err) {
          console.warn(`  ⚠️ Fel vid hjältebild för ${kennel.id}:`, err.message);
        }
      }

      // Photos array
      const photos = Array.isArray(kennel.photos) ? kennel.photos : [];
      for (let i = 0; i < photos.length; i++) {
        const photoUrl = photos[i];
        if (photoUrl && !photoUrl.includes("vercel-storage.com")) {
          try {
            const imgRes = await fetch(photoUrl);
            if (imgRes.ok) {
              const buffer = Buffer.from(await imgRes.arrayBuffer());
              const blob = await put(`urhund/kennels/${kennel.id}-gallery-${i + 1}.jpg`, buffer, {
                access: "public",
                contentType: imgRes.headers.get("content-type") || "image/jpeg",
                token,
              });
              updatedPhotos.push(blob.url);
            } else {
              updatedPhotos.push(photoUrl);
            }
          } catch {
            updatedPhotos.push(photoUrl);
          }
        } else {
          updatedPhotos.push(photoUrl);
        }
      }

      await client.query(
        "UPDATE kennels SET image = $1, photos = $2::jsonb WHERE id = $3",
        [updatedHero, JSON.stringify(updatedPhotos), kennel.id]
      );

      console.log(`  ✓ [${kennel.id}] ${kennel.name} migrerad till Vercel Blob (${updatedPhotos.length} foton)`);
    }

    console.log("\n🎉 Hela kennelregistret har framgångsrikt migrerats till Vercel Blob!");
  } catch (err) {
    console.error("❌ Migrering misslyckades:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateToVercelBlob();
