import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to database:", connectionString.split("@")[1]);
  const client = await pool.connect();

  try {
    console.log("Ensuring schema in Neon PostgreSQL...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS breeds (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        native_name VARCHAR(255) NOT NULL,
        origin VARCHAR(255) NOT NULL,
        fci_group VARCHAR(255) NOT NULL,
        tagline TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        stats JSONB NOT NULL,
        traits JSONB NOT NULL,
        coat_colors JSONB NOT NULL,
        health_checks JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS kennels (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        breed_ids JSONB NOT NULL,
        country VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        registry VARCHAR(100) NOT NULL,
        verified_health_tests BOOLEAN NOT NULL DEFAULT true,
        planning_litter BOOLEAN NOT NULL DEFAULT false,
        next_litter_estimate VARCHAR(100),
        website TEXT
      );

      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(100) PRIMARY KEY,
        author_id VARCHAR(100) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_avatar TEXT NOT NULL,
        author_role VARCHAR(50) NOT NULL,
        author_badge VARCHAR(100),
        city VARCHAR(100) NOT NULL,
        timestamp VARCHAR(100) NOT NULL,
        post_type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        likes INT NOT NULL DEFAULT 0,
        paw_count INT NOT NULL DEFAULT 0,
        target_breed_id VARCHAR(100),
        extra_data JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(100) PRIMARY KEY,
        post_id VARCHAR(100) REFERENCES posts(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        author_avatar TEXT NOT NULL,
        author_role VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        timestamp VARCHAR(100) NOT NULL,
        likes INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS dog_mates (
        id VARCHAR(100) PRIMARY KEY,
        dog_name VARCHAR(100) NOT NULL,
        registered_name VARCHAR(255) NOT NULL,
        breed_id VARCHAR(100) NOT NULL,
        breed_name VARCHAR(100) NOT NULL,
        age VARCHAR(50) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        owner_avatar TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        area VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        energy_level VARCHAR(100) NOT NULL,
        friendly_with JSONB NOT NULL,
        about TEXT NOT NULL,
        distance_km NUMERIC(5,1) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dog_sitters (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        avatar TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        area VARCHAR(255) NOT NULL,
        rate_per_day_sek INT NOT NULL,
        rating NUMERIC(3,2) NOT NULL,
        reviews_count INT NOT NULL,
        verified_id BOOLEAN NOT NULL DEFAULT true,
        experience_years INT NOT NULL,
        home_type TEXT NOT NULL,
        accepts_breeds JSONB NOT NULL,
        bio TEXT NOT NULL,
        badge VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR(100) PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        bio TEXT NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT true,
        registry VARCHAR(100),
        dog JSONB,
        kennel JSONB
      );
    `);

    // Ensure the 3 verified Asiatic breed guides exist
    const breedsCount = await client.query("SELECT COUNT(*) FROM breeds");
    if (parseInt(breedsCount.rows[0].count) === 0) {
      console.log("Seeding verified Asiatic Breeds reference data...");
      await client.query(`
        INSERT INTO breeds (id, name, native_name, origin, fci_group, tagline, description, image, stats, traits, coat_colors, health_checks)
        VALUES
        (
          'shiba-inu',
          'Shiba Inu',
          '柴犬',
          'Japan',
          'Grupp 5 - Spetsar och raser av urhundstyp',
          'Japans minsta nationalras med stor integritet och rävlik skönhet.',
          'Shiban är en uråldrig japansk jakthund som formats i bergiga områden. Den är känd för sin kattliknande renlighet, starka egenvilja och totala lojalitet mot sin familj, kombinerat med en naturlig reserverad hållning mot främlingar.',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Taka_Shiba.jpg/1200px-Taka_Shiba.jpg',
          '{"height": "35–41 cm", "weight": "8–11 kg", "lifespan": "12–15 år", "monthlyInsuranceSEK": "350–550 kr", "exerciseHoursPerDay": 2}'::jsonb,
          '{"independence": 10, "guardInstinct": 6, "preyDrive": 9, "grooming": 5, "firstTimeFriendly": 4, "winterTolerance": 9}'::jsonb,
          '[{"name": "Röd (Aka)", "hex": "#C87A41"}, {"name": "Black & Tan (Kuro)", "hex": "#232325"}, {"name": "Sesam (Goma)", "hex": "#7A5B43"}, {"name": "Vit / Creme (Shiro)", "hex": "#F3EFE6"}]'::jsonb,
          '[{"name": "Höftledsdysplasi", "code": "HD (A/B krävs för avel)", "importance": "Kritisk", "description": "Röntgen av höftleder registrerat i SKK Avelsdata."}, {"name": "Patellaluxation", "code": "Knäledskontroll (Grad 0)", "importance": "Kritisk", "description": "Kontroll att knäskålen ligger stabilt på plats."}, {"name": "GM1 / GM2 Gangliosidos", "code": "DNA-test", "importance": "Rekommenderad", "description": "Ärftlig neurologisk sjukdom som enkelt utesluts via DNA-test hos föräldradjuren."}]'::jsonb
        ),
        (
          'tibetan-mastiff',
          'Tibetansk Mastiff',
          'Do-Khyi (འདོགས་ཁྱི)',
          'Tibet / Himalaya',
          'Grupp 2 - Schnauzer, pinscher, molosser',
          'Himalayas uråldriga väktare – majestätisk, självständig och kompromisslös.',
          'Do-Khyi har i årtusenden vaktat tibetanska kloster och nomadläger. Det är inte en traditionell lydnadshund utan en självständig väktare som fattar egna beslut, patrullerar sitt revir (särskilt nattetid) och kräver en lugn, erfaren ägare med inhägnad tomt.',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Tibetan_Mastiff_2007-06-02.jpg/1200px-Tibetan_Mastiff_2007-06-02.jpg',
          '{"height": "61–76+ cm", "weight": "45–75+ kg", "lifespan": "10–12 år", "monthlyInsuranceSEK": "650–950 kr", "exerciseHoursPerDay": 2}'::jsonb,
          '{"independence": 10, "guardInstinct": 10, "preyDrive": 6, "grooming": 8, "firstTimeFriendly": 1, "winterTolerance": 10}'::jsonb,
          '[{"name": "Svart & Tan", "hex": "#1B1B1D"}, {"name": "Guld / Röd (Zang)", "hex": "#A85E2B"}, {"name": "Blå / Grå", "hex": "#4A525D"}]'::jsonb,
          '[{"name": "Höft- & Armbågsledsdysplasi", "code": "HD / ED Röntgen", "importance": "Kritisk", "description": "Avgörande för en så tung ras. Kontrollera alltid föräldrarnas ED (0) och HD (A/B)."}, {"name": "Sköldkörtel (Hypotyreos)", "code": "Blodprov (T4/TSH)", "importance": "Rekommenderad", "description": "Underfunktion i sköldkörteln förekommer inom rasen."}, {"name": "BPH / Mentalbeskrivning", "code": "SKK BPH", "importance": "Kritisk", "description": "Mentalt stabila föräldradjur är A och O för en trygg vakthund i det svenska samhället."}]'::jsonb
        ),
        (
          'akita-inu',
          'Akita Inu',
          '秋田犬',
          'Japan (Akita-prefekturen)',
          'Grupp 5 - Spetsar och raser av urhundstyp',
          'Symbolen för lojalitet och värdighet i Japan.',
          'Ursprungligen använd för jakt på björn och vildsvin i norra Japan. Akitan är lugn, tystlåten inomhus och djupt fäst vid sin familj, men har ofta en hög skärpa mot andra hundar av samma kön.',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Akita_inu.jpeg/1200px-Akita_inu.jpeg',
          '{"height": "58–70 cm", "weight": "30–45 kg", "lifespan": "10–13 år", "monthlyInsuranceSEK": "450–700 kr", "exerciseHoursPerDay": 2.5}'::jsonb,
          '{"independence": 9, "guardInstinct": 8, "preyDrive": 8, "grooming": 6, "firstTimeFriendly": 2, "winterTolerance": 10}'::jsonb,
          '[{"name": "Röd fawn", "hex": "#C27D48"}, {"name": "Tigrerad (Brindle)", "hex": "#4E3E33"}, {"name": "Vit", "hex": "#F5F5F5"}]'::jsonb,
          '[{"name": "Sebaceous Adenitis (SA)", "code": "Hudbiopsi / Linjeanalys", "importance": "Kritisk", "description": "Autoimmun hudsjukdom. Seriösa uppfödare har full koll på linjernas historik."}, {"name": "Ögonlysning & HD", "code": "ECVO + HD A/B", "importance": "Kritisk", "description": "Krav från rasklubben för valphänvisning."}]'::jsonb
        )
      `);
    }

    console.log("Database schema ready with zero placeholder data.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
