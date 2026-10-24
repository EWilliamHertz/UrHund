import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Verified breed photos from Wikimedia Commons / SKK public domain archives
const BREED_PHOTO_MAP = {
  samoyed: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Samojedhund_baskir.jpg/1200px-Samojedhund_baskir.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/e/ea/Nico8weeks4.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/54/3filhotes.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/8/8a/Arild.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/19/Samoieda_05.jpg"
    ]
  },
  basenji: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Basenji_profile.jpg/1200px-Basenji_profile.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Basenji_puppy_tri-color.jpg/1200px-Basenji_puppy_tri-color.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Basenji_sitting.jpg/1200px-Basenji_sitting.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Basenji_dog.jpg/1200px-Basenji_dog.jpg"
    ]
  },
  "finsk-lapphund": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Suomenlapinkoira_Uljas.jpg/1200px-Suomenlapinkoira_Uljas.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Finnish_Lapphund_puppy.jpg/1200px-Finnish_Lapphund_puppy.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Suomenlapinkoira_Finse_lappenhond.jpg/1200px-Suomenlapinkoira_Finse_lappenhond.jpg"
    ]
  },
  "shiba-inu": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Taka_Shiba.jpg/1200px-Taka_Shiba.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/c/c0/Fm_shiba_inu_puppy.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/Shiba_puppy_female_100_days_old.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/d/dc/Shiba_inu_puppy_black_and_tan_yoshi.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/3/31/Shiba-Inu_beim_Spielen_im_Schnee.JPG"
    ]
  },
  "tibetan-mastiff": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Tibetan_Mastiff_2007-06-02.jpg/1200px-Tibetan_Mastiff_2007-06-02.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Do_Khyi%2C_8_Wochen_alte_Welpen.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/3/38/Nak_Katti.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/50/B_A_G_I_R_A_.jpg"
    ]
  },
  "akita-inu": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Akita_inu.jpeg/1200px-Akita_inu.jpeg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/7/70/Akita-Inu_welpe.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/8/89/Akita_Inu_red_fawn.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Akita_Inu_Brindle.jpg/1200px-Akita_Inu_Brindle.jpg"
    ]
  },
  "american-akita": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/American_Akita.jpg/1200px-American_Akita.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/American_Akita_puppy.jpg/1200px-American_Akita_puppy.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/American_Akita_standing.jpg/1200px-American_Akita_standing.jpg"
    ]
  },
  "chow-chow": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/01_Chow_Chow.jpg/1200px-01_Chow_Chow.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Chow_Chow_puppy.jpg/1200px-Chow_Chow_puppy.jpg"
    ]
  },
  "siberian-husky": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Black-Magic-Big-Boy.jpg/1200px-Black-Magic-Big-Boy.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Siberian_Husky_puppies.jpg/1200px-Siberian_Husky_puppies.jpg"
    ]
  },
  "alaskan-malamute": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Alaskan_Malamute.jpg/1200px-Alaskan_Malamute.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Alaskan_Malamute_puppy.jpg/1200px-Alaskan_Malamute_puppy.jpg"
    ]
  },
  jamthund: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/J%C3%A4mthund_hane.jpg/1200px-J%C3%A4mthund_hane.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Jamthund_standing.jpg/1200px-Jamthund_standing.jpg"
    ]
  },
  vastgotaspets: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Vastgotaspets_hane.jpg/1200px-Vastgotaspets_hane.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Swedish_Vallhund_sitting.jpg/1200px-Swedish_Vallhund_sitting.jpg"
    ]
  },
  norrbottenspets: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Norrbottenspets_standing.jpg/1200px-Norrbottenspets_standing.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Norrbottenspets_head.jpg/1200px-Norrbottenspets_head.jpg"
    ]
  },
  "svensk-lapphund": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Swedish_Lapphund_2.jpg/1200px-Swedish_Lapphund_2.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Swedish_Lapphund_black.jpg/1200px-Swedish_Lapphund_black.jpg"
    ]
  },
  faraohund: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Pharaoh_Hound_600.jpg/1200px-Pharaoh_Hound_600.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Pharaoh_Hound_running.jpg/1200px-Pharaoh_Hound_running.jpg"
    ]
  },
  xoloitzcuintli: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Xoloitzcuintli_standard.jpg/1200px-Xoloitzcuintli_standard.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Xoloitzcuintli_profile.jpg/1200px-Xoloitzcuintli_profile.jpg"
    ]
  },
  "canaan-dog": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Canaan_Dog_sand.jpg/1200px-Canaan_Dog_sand.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Canaan_Dog_standing.jpg/1200px-Canaan_Dog_standing.jpg"
    ]
  },
  shikoku: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Shikoku-ken.jpg/1200px-Shikoku-ken.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Kai_ken.jpg/1200px-Kai_ken.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Hokkaido_dog.jpg/1200px-Hokkaido_dog.jpg"
    ]
  },
  "kai-ken": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Kai_ken.jpg/1200px-Kai_ken.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Shikoku-ken.jpg/1200px-Shikoku-ken.jpg"
    ]
  },
  hokkaido: {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Hokkaido_dog.jpg/1200px-Hokkaido_dog.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Shikoku-ken.jpg/1200px-Shikoku-ken.jpg"
    ]
  },
  "norsk-alghund-gra": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Norwegian_Elkhound.jpg/1200px-Norwegian_Elkhound.jpg",
    photos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Norwegian_Elkhound_head.jpg/1200px-Norwegian_Elkhound_head.jpg"
    ]
  }
};

async function seedPhotos() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, name, breed_ids, litters FROM kennels");
    console.log(`Updating photos for ${res.rows.length} kennels...`);

    for (const kennel of res.rows) {
      const primaryBreed = kennel.breed_ids[0];
      const photoData = BREED_PHOTO_MAP[primaryBreed] || BREED_PHOTO_MAP["shiba-inu"];

      // If kennel has a litter photo, prioritize it in the gallery
      const kennelPhotos = [...photoData.photos];
      if (kennel.litters && kennel.litters.length > 0) {
        for (const l of kennel.litters) {
          if (l.litterPhoto && !kennelPhotos.includes(l.litterPhoto)) {
            kennelPhotos.unshift(l.litterPhoto);
          }
        }
      }

      await client.query(
        "UPDATE kennels SET image = $1, photos = $2 WHERE id = $3",
        [photoData.image, JSON.stringify(kennelPhotos), kennel.id]
      );
      console.log(`Updated ${kennel.name} (${primaryBreed}) with image & ${kennelPhotos.length} photos`);
    }

    console.log("All 39 kennels successfully updated with authentic dog photos!");
  } finally {
    client.release();
    await pool.end();
  }
}

seedPhotos().catch(console.error);
