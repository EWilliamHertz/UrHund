import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, name FROM kennels;");
    for (const row of res.rows) {
      const cleanSlug = row.name
        .toLowerCase()
        .replace(/^kennel\s+/i, "")
        .replace(/\s+kennel$/i, "")
        .trim()
        .replace(/[åä]/g, "a")
        .replace(/[ö]/g, "o")
        .replace(/['"’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const directUrl = `https://www.kopahund.se/uppfodare/${cleanSlug}/`;
      await client.query("UPDATE kennels SET kopahund_url = $1 WHERE id = $2;", [
        directUrl,
        row.id,
      ]);
    }
    console.log(`Updated ${res.rows.length} kennels with direct kopahund.se breeder profile URLs.`);

    const check = await client.query(
      "SELECT id, name, kopahund_url FROM kennels LIMIT 5;"
    );
    console.log("Sample updated records:", check.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
