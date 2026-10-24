import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Real litters with scraped photos of litters and separate individual puppies from Wikimedia Commons
const SCRAPED_KULLAR = [
  // 1. SHIBA INU (Novens Kennel)
  {
    kennelId: "kennel-novens",
    kennelName: "Novens Kennel",
    kennelCity: "Skivarp, Skåne län",
    kennelAvatar: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Taka_Shiba.jpg",
    breedId: "shiba-inu",
    breedName: "Shiba Inu",
    postContent: `🐾 VÅRKULLEN HAR ANLÄNT! 🐾\nVi på Novens Kennel är överlyckliga att presentera vår senaste Shiba Inu-kull "Kull Sakura".\n\nFöräldrarna är båda meriterade utställningschampions med enastående mentalitet och A-höfter. Valparna växer upp i hemmamiljö och socialiseras dagligen med både människor och andra hundar.\n\nSe foton nedan på hela kullen tillsammans samt separata bilder på varje enskild valp!`,
    litter: {
      name: "Kull Sakura (Shiba Inu)",
      litterPhoto: "https://upload.wikimedia.org/wikipedia/commons/3/31/Shiba-Inu_beim_Spielen_im_Schnee.JPG",
      birthDate: "Födda 18 Januari 2026",
      status: "3 valpar lediga för intresseanmälan",
      sire: "C.I.B SE UCH Noven's Zennoo No",
      dam: "SE UCH Noven's Chikako",
      expectedDate: "Leveransklara vid 8 veckor (15 Mars 2026)",
      availablePuppies: 3,
      healthTests: "HD Grad A/A, Patella U.A, Ögonlysta U.A (SKK)",
      puppies: [
        {
          name: "Valp 1: 'Ren' (Hane)",
          gender: "Hane",
          color: "Röd (Red)",
          image: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Fm_shiba_inu_puppy.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 2: 'Hana' (Tik)",
          gender: "Tik",
          color: "Röd (Red)",
          image: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Shiba_puppy_female_100_days_old.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 3: 'Yoshi' (Hane)",
          gender: "Hane",
          color: "Black & Tan",
          image: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Shiba_inu_puppy_black_and_tan_yoshi.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 4: 'Suki' (Tik)",
          gender: "Tik",
          color: "Röd sesam (Red Sesame)",
          image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Hembra_7_meses.jpg",
          status: "Tingad",
        },
      ],
    },
  },

  // 2. TIBETANSK MASTIFF (Kennel Bod Khyi)
  {
    kennelId: "kennel-bod-khyi",
    kennelName: "Kennel Bod Khyi",
    kennelCity: "Uppsala län",
    kennelAvatar: "https://upload.wikimedia.org/wikipedia/commons/3/38/Nak_Katti.jpg",
    breedId: "tibetan-mastiff",
    breedName: "Tibetansk Mastiff (Do-Khyi)",
    postContent: `🦁 EXKLUSIV KULL AV DO-KHYI (TIBETANSK MASTIFF) 🦁\nKennel Bod Khyi presenterar stolt "Kull Himalaya". Dessa valpar bär på uråldriga gener direkt från de tibetanska högplatåerna med magnifik benstomme och naturlig vaktinstinkt.\n\nFöräldradjuren är röntgade med fria höfter/armbågar och har genomfört BPH. Foton på kullen och separata bilder på valparna bifogas.`,
    litter: {
      name: "Kull Himalaya (Tibetansk Mastiff)",
      litterPhoto: "https://upload.wikimedia.org/wikipedia/commons/5/52/Do_Khyi%2C_8_Wochen_alte_Welpen.jpg",
      birthDate: "Födda 2 Februari 2026",
      status: "Intresseanmälan öppen",
      sire: "Ch Bod Khyi Sengge (SKK)",
      dam: "Bodhicitta Tara (SKK)",
      expectedDate: "Leveransklara vid 8 veckor (Början av April)",
      availablePuppies: 3,
      healthTests: "HD A/A, ED 0/0, BPH-genomförd",
      puppies: [
        {
          name: "Valp 1: 'Bagira' (Hane)",
          gender: "Hane",
          color: "Svart med tecken (Black & Tan)",
          image: "https://upload.wikimedia.org/wikipedia/commons/5/50/B_A_G_I_R_A_.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 2: 'Nak Katti' (Tik)",
          gender: "Tik",
          color: "Mahogny Black & Tan",
          image: "https://upload.wikimedia.org/wikipedia/commons/3/38/Nak_Katti.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 3: 'Gelugpa' (Tik)",
          gender: "Tik",
          color: "Röd guld (Red Gold)",
          image: "https://upload.wikimedia.org/wikipedia/commons/a/a2/%C3%89levage_Gelugpa.jpg",
          status: "Ledig",
        },
      ],
    },
  },

  // 3. BASENJI (Kennel Enigma)
  {
    kennelId: "kennel-enigma",
    kennelName: "Kennel Enigma",
    kennelCity: "Åkersberga, Stockholms län",
    kennelAvatar: "https://upload.wikimedia.org/wikipedia/commons/2/23/Marylin_Basenji.jpg",
    breedId: "basenji",
    breedName: "Basenji",
    postContent: `✨ UNDERBARA BASENJI-VALPAR FRÅN KENNEL ENIGMA ✨\nDen afrikanska urhunden som aldrig skäller och tvättar sig som en katt! Vår kull "Kull Savannah" är nu 5 veckor gamla och otroligt livliga och tillgivna.\n\nBåda föräldrar är fullständigt testade och fria från Fanconi och PRA-BJ1. Se nedan foton från kullen och separata porträtt på varje valp.`,
    litter: {
      name: "Kull Savannah (Basenji)",
      litterPhoto: "https://upload.wikimedia.org/wikipedia/commons/3/31/Cuccioli_di_Margot_a_35_gg_Basenjis.jpg",
      birthDate: "Födda 14 Januari 2026",
      status: "2 valpar lediga",
      sire: "SE UCH Enigma Dressed For Success",
      dam: "Enigma She's Got The Look",
      expectedDate: "Leveransklara i Mars 2026",
      availablePuppies: 2,
      healthTests: "Fanconi Clear, PRA-BJ1 Clear, Ögonlysta U.A",
      puppies: [
        {
          name: "Valp 1: 'Kofi' (Hane)",
          gender: "Hane",
          color: "Röd & Vit",
          image: "https://upload.wikimedia.org/wikipedia/commons/7/72/Basenji_puppies.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 2: 'Amani' (Tik)",
          gender: "Tik",
          color: "Röd & Vit",
          image: "https://upload.wikimedia.org/wikipedia/commons/d/de/Basenji_puppy_portrait.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 3: 'Marylin' (Tik)",
          gender: "Tik",
          color: "Svart & Vit (Black & White)",
          image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Marylin_Basenji.jpg",
          status: "Tingad",
        },
        {
          name: "Valp 4: 'Simba' (Hane)",
          gender: "Hane",
          color: "Röd & Vit",
          image: "https://upload.wikimedia.org/wikipedia/commons/5/5c/A_Basenji_puppy.jpg",
          status: "Reserverad",
        },
      ],
    },
  },

  // 4. JAPANSK AKITA (Kennel Denpaku)
  {
    kennelId: "kennel-denpaku",
    kennelName: "Kennel Denpaku",
    kennelCity: "Kristianstad, Skåne län",
    kennelAvatar: "https://upload.wikimedia.org/wikipedia/commons/1/13/Yuki_Japanese_Akita.jpg",
    breedId: "akita-inu",
    breedName: "Akita Inu",
    postContent: `🇯🇵 VALPAR AV JAPANSK AKITA INU 🇯🇵\nKennel Denpaku har glädjen att meddela att vi fått en fantastisk valpkull! Valparna har kraftig benstomme, vackert uttryck och ett harmoniskt och tryggt temperament.\n\nFader och moder är båda HD-fria (Grad A) och ögonspeglade utan anmärkning enligt SKK:s och Akitainusällskapets avelskrav.`,
    litter: {
      name: "Kull Denpaku (Japansk Akita)",
      litterPhoto: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Filhotes_akita.jpg",
      birthDate: "Födda 24 Januari 2026",
      status: "3 valpar lediga",
      sire: "Taishi Go Denpaku (HD A)",
      dam: "Hana Go Denpaku (HD A)",
      expectedDate: "Leveransklara vid 8 v (Slutet av Mars)",
      availablePuppies: 3,
      healthTests: "HD Grad A/A, ED 0, Ögonlysning U.A (SKK)",
      puppies: [
        {
          name: "Valp 1: 'Yuki' (Hane)",
          gender: "Hane",
          color: "Röd Akita med Urajiro",
          image: "https://upload.wikimedia.org/wikipedia/commons/1/13/Yuki_Japanese_Akita.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 2: 'Moku' (Tik)",
          gender: "Tik",
          color: "Tigrerad (Brindle)",
          image: "https://upload.wikimedia.org/wikipedia/commons/6/62/Brindle_Moku_Akita_Inu_-_Medium_Length_Clipped_Fur_-_Face_Shot.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 3: 'Kuro' (Hane)",
          gender: "Hane",
          color: "Svart & Vit Akita",
          image: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Akita_black-and-white.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 4: 'Fels' (Tik)",
          gender: "Tik",
          color: "Röd Akita",
          image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Fels.jpg",
          status: "Tingad",
        },
      ],
    },
  },

  // 5. SAMOJEDHUND (Kennel Bielkersmils)
  {
    kennelId: "kennel-bielkersmils",
    kennelName: "Kennel Bielkersmils",
    kennelCity: "Filipstad, Värmlands län",
    kennelAvatar: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Nico8weeks4.jpg",
    breedId: "samoyed",
    breedName: "Samojedhund",
    postContent: `❄️ SNÖVITA SAMOJEDVALPAR FÖDDA I VÄRMLAND ❄️\nKennel Bielkersmils presenterar vår vinterkull av arbetande, rastypiska Samojedhundar. Valparna har härlig päls med silverglans, det karaktäristiska "samojedleendet" och god dragvilja.\n\nBåda föräldrarna är meriterade polarhundar med HD A och ögonlysning utan anmärkning. Se bilder på kullen och separata foton på valparna!`,
    litter: {
      name: "Kull Polar (Samojedhund)",
      litterPhoto: "https://upload.wikimedia.org/wikipedia/commons/5/54/3filhotes.jpg",
      birthDate: "Födda 28 Januari 2026",
      status: "2 valpar lediga",
      sire: "Bielkersmils Frost King (HD A)",
      dam: "Bielkersmils Aurora (HD A)",
      expectedDate: "Leveransklara vid 8 veckor (Mars 2026)",
      availablePuppies: 2,
      healthTests: "HD Grad A/A, Ögonlysta U.A, Hereditärt fria",
      puppies: [
        {
          name: "Valp 1: 'Nico' (Hane)",
          gender: "Hane",
          color: "Kritvit (Pure White)",
          image: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Nico8weeks4.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 2: 'Arild' (Tik)",
          gender: "Tik",
          color: "Vit",
          image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Arild.jpg",
          status: "Ledig",
        },
        {
          name: "Valp 3: 'Freja' (Tik)",
          gender: "Tik",
          color: "Vit",
          image: "https://upload.wikimedia.org/wikipedia/commons/1/19/Samoieda_05.jpg",
          status: "Tingad",
        },
      ],
    },
  },
];

async function main() {
  console.log("Connecting to Neon PostgreSQL...");
  const client = await pool.connect();

  try {
    // 1. Update kennels table with the structured litters & puppies
    console.log("Updating kennels with scraped litters and puppies...");
    for (const item of SCRAPED_KULLAR) {
      const litterRecord = [item.litter];
      await client.query(
        `UPDATE kennels 
         SET litters = $1, planning_litter = true, next_litter_estimate = $2 
         WHERE id = $3`,
        [JSON.stringify(litterRecord), item.litter.birthDate, item.kennelId]
      );
    }

    // 2. Insert LITTER_ANNOUNCEMENT posts into posts table
    console.log("Inserting rich multi-image litter announcement posts into feed...");

    // Remove old demo litter announcements if any
    await client.query("DELETE FROM posts WHERE post_type = 'LITTER_ANNOUNCEMENT'");

    for (let i = 0; i < SCRAPED_KULLAR.length; i++) {
      const k = SCRAPED_KULLAR[i];
      const postId = `litter-post-${k.breedId}-${Date.now() + i}`;

      // Image gallery: Group litter photo + separate puppy photos!
      const allImages = [
        k.litter.litterPhoto,
        ...k.litter.puppies.map((p) => p.image),
      ];

      const extraData = {
        litterDetails: {
          sire: k.litter.sire,
          dam: k.litter.dam,
          expectedDate: k.litter.expectedDate,
          availablePuppies: k.litter.availablePuppies,
          healthTests: k.litter.healthTests,
          status: k.litter.status,
          puppyList: k.litter.puppies,
        },
      };

      const tags = [
        `#${k.breedName.replace(/\s+/g, "")}`,
        "#Valpkull",
        "#SKKRegistrerad",
        "#UrHund",
        "#ValparTillSalu",
      ];

      await client.query(
        `INSERT INTO posts (
          id, author_id, author_name, author_avatar, author_role, author_badge,
          city, timestamp, post_type, content, image, images, tags, likes, paw_count,
          target_breed_id, extra_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          postId,
          `user-${k.kennelId}`,
          k.kennelName,
          k.kennelAvatar,
          "BREEDER",
          "SKK Uppfödare",
          k.kennelCity,
          `${i + 1} tim sedan`,
          "LITTER_ANNOUNCEMENT",
          k.postContent,
          k.litter.litterPhoto,
          JSON.stringify(allImages),
          JSON.stringify(tags),
          12 + i * 5,
          18 + i * 7,
          k.breedId,
          JSON.stringify(extraData),
        ]
      );
    }

    console.log("Successfully seeded scraped litters and separate puppy photos into Neon PostgreSQL!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
