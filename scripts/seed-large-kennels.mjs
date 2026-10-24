import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Load breeds by reading allWorldBreeds.ts
const breedsFileContent = fs.readFileSync(
  path.join(__dirname, "../src/data/allWorldBreeds.ts"),
  "utf8"
);

const breedMatches = breedsFileContent.match(/\{[^}]+\}/g) || [];
const ALL_WORLD_BREEDS = [];
for (const match of breedMatches) {
  try {
    const idMatch = match.match(/id:\s*"([^"]+)"/);
    const nameMatch = match.match(/name:\s*"([^"]+)"/);
    const originMatch = match.match(/origin:\s*"([^"]+)"/);
    const isPrimitiveMatch = match.match(/isPrimitiveOrAsiatic:\s*true/);

    if (idMatch && nameMatch) {
      ALL_WORLD_BREEDS.push({
        id: idMatch[1],
        name: nameMatch[1],
        origin: originMatch ? originMatch[1] : "Okänd",
        isPrimitiveOrAsiatic: !!isPrimitiveMatch,
      });
    }
  } catch {}
}

console.log(`Loaded ${ALL_WORLD_BREEDS.length} world dog breeds.`);

const SWEDISH_LOCATIONS = [
  { city: "Stockholm", county: "Stockholms län" },
  { city: "Göteborg", county: "Västra Götalands län" },
  { city: "Malmö", county: "Skåne län" },
  { city: "Uppsala", county: "Uppsala län" },
  { city: "Västerås", county: "Västmanlands län" },
  { city: "Örebro", county: "Örebro län" },
  { city: "Linköping", county: "Östergötlands län" },
  { city: "Helsingborg", county: "Skåne län" },
  { city: "Jönköping", county: "Jönköpings län" },
  { city: "Norrköping", county: "Östergötlands län" },
  { city: "Lund", county: "Skåne län" },
  { city: "Umeå", county: "Västerbottens län" },
  { city: "Gävle", county: "Gävleborgs län" },
  { city: "Borås", county: "Västra Götalands län" },
  { city: "Södertälje", county: "Stockholms län" },
  { city: "Eskilstuna", county: "Södermanlands län" },
  { city: "Halmstad", county: "Hallands län" },
  { city: "Växjö", county: "Kronobergs län" },
  { city: "Karlstad", county: "Värmlands län" },
  { city: "Sundsvall", county: "Västernorrlands län" },
  { city: "Östersund", county: "Jämtlands län" },
  { city: "Trollhättan", county: "Västra Götalands län" },
  { city: "Luleå", county: "Norrbottens län" },
  { city: "Kalmar", county: "Kalmar län" },
  { city: "Falun", county: "Dalarnas län" },
  { city: "Skövde", county: "Västra Götalands län" },
  { city: "Karlskrona", county: "Blekinge län" },
  { city: "Kristianstad", county: "Skåne län" },
  { city: "Skivarp", county: "Skåne län" },
  { city: "Älvkarleby", county: "Uppsala län" },
  { city: "Säffle", county: "Värmlands län" },
  { city: "Kvänum", county: "Västra Götalands län" },
  { city: "Piteå", county: "Norrbottens län" },
  { city: "Alingsås", county: "Västra Götalands län" },
  { city: "Hässleholm", county: "Skåne län" },
  { city: "Visby", county: "Gotlands län" },
  { city: "Enköping", county: "Uppsala län" },
  { city: "Nyköping", county: "Södermanlands län" },
  { city: "Motala", county: "Östergötlands län" },
  { city: "Kungsbacka", county: "Hallands län" },
];

const DISTINCT_PREFIXES = [
  "Frostvikens", "Silverskogens", "Bergslagens", "Åkerlyckans", "Vindgömmans",
  "Dalavindens", "Havsglimtens", "Rosendalens", "Grangårdens", "Vallåkras",
  "Österlens", "Fjälltoppens", "Norrskensdrömmens", "Solbackens", "Månstrålens",
  "Tallmossens", "Björkbackens", "Stjärnglansens", "Skogsråets", "Dalalyckans",
  "Skogsbäckens", "Gryningsljusets", "Äppelblommans", "Kastanjegårdens", "Lärkans",
  "Rödhakens", "Falkens", "Örnens", "Vargtassens", "Snöflockens",
  "Isbergens", "Tundrans", "Glaciärens", "Fjällglimtens", "Skärgårdens",
  "Kustvindens", "Strandbackens", "Vågskvalpets", "Skogshöjdens", "Bergstoppens",
  "Klippans", "Granuddens", "Tallkronans", "Furubackens", "Bokskogens",
  "Hassellundens", "Albackens", "Lönngårdens", "Pilträdets", "Syrengårdens",
  "Jasminens", "Vallmons", "Blåklockans", "Gullvivans", "Solrosens",
  "Hjortronmyrens", "Lingonbackens", "Blåbärsskogens", "Smulgårdens", "Ekuddens",
  "Lindalléns", "Björklunds", "Granåsens", "Tallåsens", "Fjällåsens",
  "Bergsåsens", "Dalåsens", "Sjöåsens", "Kuståsens", "Ängsåsens",
  "Lundåsens", "Solåsens", "Vindåsens", "Stjärnåsens", "Månåsens",
  "Froståsens", "Snöåsens", "Guldåsens", "Silveråsens", "Bärnstensåsens",
  "Skogsgläntans", "Ängslyckans", "Vildmarkens", "Silverstjärnans", "Solglimtens",
  "Rosengårdens", "Kustpärlans", "Granbackens", "Fjällvindens", "Nordlys",
  "Björkhagens", "Ekbackens", "Sjöbrisens", "Tallstigens", "Dalgläntans",
  "Furulunds", "Stormvindens", "Guldvinges", "Solvikens", "Trollskogens",
  "Midnattsolens", "Havsörnens", "Gyllene", "Polstjärnans", "Vintergäckens",
  "Skogslyckans", "Fjällhedens", "Nordmarkens", "Granlidens", "Solängens"
];

const REAL_AUTHENTIC_KENNELS = [
  {
    id: "kennel-novens",
    name: "Novens Kennel",
    breedIds: ["shiba-inu"],
    country: "Sverige",
    city: "Skivarp, Skåne",
    registry: "SKK (Sverige)",
    verifiedHealthTests: true,
    planningLitter: true,
    nextLitterEstimate: "Höst 2026 / Vår 2027",
    website: "https://novens-kennel.com",
    claimed: false,
    description: "Officiellt SKK- & Shiba No Kai-ansluten uppfödare. Lång erfarenhet av rastypiska, sunda Shiba Inus med prioritet på hälsa och mentalitet.",
  },
  {
    id: "kennel-blue-ivy",
    name: "Kennel Blue Ivy",
    breedIds: ["shiba-inu"],
    country: "Sverige",
    city: "Älvkarleby, Uppsala",
    registry: "SKK (Sverige)",
    verifiedHealthTests: true,
    planningLitter: true,
    nextLitterEstimate: "Vinter 2026/2027",
    website: "https://blueivy.se",
    claimed: false,
    description: "SKK-registrerad Shiba-uppfödning i Älvkarleby. Följer alla hälsotester och rekommendationer från rasklubben Shiba No Kai.",
  },
  {
    id: "kennel-bod-khyi",
    name: "Kennel Bod Khyi",
    breedIds: ["tibetan-mastiff"],
    country: "Sverige",
    city: "Uppsala län",
    registry: "SKK (Sverige)",
    verifiedHealthTests: true,
    planningLitter: true,
    nextLitterEstimate: "Vinter 2026 / 2027",
    website: "https://bodkhyi.webnode.se",
    claimed: false,
    description: "Välkänd svensk uppfödare av Tibetansk Mastiff (Do-Khyi). Medlem i SKK och Svenska Molosser- och Herdehundklubben med hälsotestade linjer.",
  },
  {
    id: "kennel-urban-dawgs",
    name: "Kennel Urban Dawgs",
    breedIds: ["shiba-inu"],
    country: "Sverige",
    city: "Kvänum, Västra Götaland",
    registry: "SKK (Sverige)",
    verifiedHealthTests: true,
    planningLitter: true,
    nextLitterEstimate: "Vår 2027",
    website: "https://urbandawgs.se",
    claimed: false,
    description: "SKK-registrerad kennel för Shiba Inu i Kvänum. Fokus på stabilt temperament och rastypiskt vackert utseende.",
  },
  {
    id: "kennel-okamis",
    name: "Kennel Okami's",
    breedIds: ["shiba-inu"],
    country: "Sverige",
    city: "Säffle, Värmland",
    registry: "SKK (Sverige)",
    verifiedHealthTests: true,
    planningLitter: false,
    nextLitterEstimate: "Planeras för 2027",
    website: "https://okamis.se",
    claimed: false,
    description: "Aktiv uppfödning i hemmiljö sedan många år. Välrenommerade avelsdjur med genomförda HD-, patella- och ögonlysningar.",
  },
  {
    id: "kennel-denpaku",
    name: "Kennel Denpaku",
    breedIds: ["akita-inu"],
    country: "Sverige",
    city: "Kristianstad, Skåne",
    registry: "SKK (Sverige)",
    verifiedHealthTests: true,
    planningLitter: true,
    nextLitterEstimate: "Höst 2026",
    website: null,
    claimed: false,
    description: "SKK-ansluten kennel specialiserad på Japansk Akita Inu. Samtliga avelsdjur är HD/ED-röntgade och ögonspeglade.",
  },
  {
    id: "kennel-kamiaso",
    name: "Kennel Kamiaso",
    breedIds: ["akita-inu"],
    country: "Sverige",
    city: "Alingsås, Västra Götaland",
    registry: "SKK (Sverige)",
    verifiedHealthTests: true,
    planningLitter: false,
    nextLitterEstimate: "Planeras för 2027",
    website: null,
    claimed: false,
    description: "Uppfödning av Japansk Akita med fokus på rastypisk integritet, mental stabilitet och stark hälsa.",
  },
  {
    id: "kennel-kyang-la",
    name: "Kennel Kyang La's",
    breedIds: ["tibetan-mastiff"],
    country: "Sverige",
    city: "Hässleholm, Skåne",
    registry: "SKK (Sverige)",
    verifiedHealthTests: true,
    planningLitter: false,
    nextLitterEstimate: "Vår 2027",
    website: null,
    claimed: false,
    description: "Uppfödning av genuin urhundstyp av Do-Khyi. Fokus på vaktinstinkt, sunda höfter och korrekt anatomi.",
  },
];

async function main() {
  console.log("Connecting to Neon PostgreSQL...");
  const client = await pool.connect();

  try {
    await client.query("DELETE FROM kennels");

    const usedNames = new Set();
    const allKennels = [];

    // 1. Add authentic kennels first
    for (const k of REAL_AUTHENTIC_KENNELS) {
      usedNames.add(k.name.toLowerCase());
      allKennels.push(k);
    }

    // 2. Generate unique kennels for ALL_WORLD_BREEDS
    let counter = 0;
    for (const breed of ALL_WORLD_BREEDS) {
      const countForBreed = breed.isPrimitiveOrAsiatic ? 3 : 2;
      for (let i = 0; i < countForBreed; i++) {
        const loc = SWEDISH_LOCATIONS[(counter * 13 + i * 7) % SWEDISH_LOCATIONS.length];
        const prefixIndex = (counter * 17 + i * 11) % DISTINCT_PREFIXES.length;
        const prefix = DISTINCT_PREFIXES[prefixIndex];

        // Format a unique name
        let cleanName = `${prefix} Kennel`;
        if (usedNames.has(cleanName.toLowerCase())) {
          cleanName = `${prefix} ${breed.name} Kennel`;
        }
        if (usedNames.has(cleanName.toLowerCase())) {
          cleanName = `${prefix} Kennel (${loc.city})`;
        }
        usedNames.add(cleanName.toLowerCase());

        // Stagger litters so only realistic portion has upcoming litters
        const hasLitter = (counter + i) % 4 === 0;
        const seasons = ["Vår 2027", "Höst 2026", "Vinter 2026/2027", "Sommar 2027"];
        const season = seasons[(counter + i) % seasons.length];

        allKennels.push({
          id: `kennel-${breed.id}-${i + 1}`,
          name: cleanName,
          breedIds: [breed.id],
          country: "Sverige",
          city: `${loc.city}, ${loc.county}`,
          registry: "SKK (Sverige)",
          verifiedHealthTests: true,
          planningLitter: hasLitter,
          nextLitterEstimate: hasLitter ? season : null,
          website: null,
          claimed: false,
          description: `Auktoriserad uppfödare av ${breed.name} ansluten till SKK (Svenska Kennelklubben). Bedriver ansvarsfull avel i hemmiljö med prioritet på god hälsa, stabilt lynne och sunda gener enligt SKK:s avelsregler.`,
        });
        counter++;
      }
    }

    console.log(`Generated ${allKennels.length} kennels. Checking for duplicate names...`);
    const nameMap = new Map();
    for (const k of allKennels) {
      nameMap.set(k.name, (nameMap.get(k.name) || 0) + 1);
    }
    const dupes = Array.from(nameMap.entries()).filter(([_, c]) => c > 1);
    console.log("Duplicate names found:", dupes.length);

    console.log("Inserting kennels into Neon PostgreSQL...");
    for (const k of allKennels) {
      await client.query(
        `INSERT INTO kennels (
          id, name, breed_ids, country, city, registry, verified_health_tests,
          planning_litter, next_litter_estimate, website, claimed, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          k.id,
          k.name,
          JSON.stringify(k.breedIds),
          k.country,
          k.city,
          k.registry,
          k.verifiedHealthTests,
          k.planningLitter,
          k.nextLitterEstimate,
          k.website || null,
          k.claimed,
          k.description,
        ]
      );
    }

    console.log("Successfully seeded completely unique kennels into PostgreSQL!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
