export type UserRole = "BREEDER" | "DOG_OWNER" | "SEEKING_DOG";

export interface DogItem {
  id: string;
  name: string;
  registeredName?: string;
  breedId: string;
  breedName: string;
  age: string;
  gender: "Hane" | "Tik";
  color?: string;
  image: string;
  traits?: string[];
  bio?: string;
  healthStatus?: string;
  lookingFor?: ("MATES" | "SITTING" | "BREEDING")[];
}

export interface DesiredDog {
  id?: string;
  breedName: string;
  breedId?: string;
  timeframe: string; // e.g. "Söker denna hundrasen vid: 2030 / 2031"
  years?: string;
  preparationStatus?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar: string;
  location: string;
  city: string;
  bio: string;
  verified: boolean;
  createdAt?: string;
  registry?: "SKK (Sverige)" | "NIPPO (Japan)" | "FCI (Europa)";
  dog?: DogItem;
  dogs?: DogItem[];
  prospectiveInfo?: {
    interestedBreeds: string[];
    livingSituation: string;
    experience: string;
    timeframe: string;
    notes?: string;
    desiredDogs?: DesiredDog[];
  };
  kennel?: {
    id: string;
    name: string;
    prefix: string;
    establishedYear: number;
    breeds: string[];
    plannedLitters: string;
    website: string;
  };
}

export function formatMembershipDuration(createdAt?: string): string {
  if (!createdAt) return "Medlem i gemenskapen";
  try {
    const created = new Date(createdAt);
    if (isNaN(created.getTime())) return "Medlem i gemenskapen";
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Medlem sedan idag";
    if (diffDays === 1) return "Medlem i 1 dag";
    if (diffDays < 30) return `Medlem i ${diffDays} dagar`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "Medlem i 1 månad";
    if (diffMonths < 12) return `Medlem i ${diffMonths} månader`;

    const diffYears = Math.floor(diffMonths / 12);
    if (diffYears === 1) return "Medlem i 1 år";
    return `Medlem i ${diffYears} år`;
  } catch {
    return "Medlem i gemenskapen";
  }
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  text: string;
  timestamp: string;
  likes: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorBadge?: string;
  city: string;
  timestamp: string;
  postType: "STATUS" | "LITTER_ANNOUNCEMENT" | "PLAYDATE_REQUEST" | "DOG_SITTING" | "AI_TIP" | "SPONSORED_AD" | "SEEKING_PUPPY";
  content: string;
  image?: string;
  images?: string[];
  tags: string[];
  likes: number;
  hasLiked?: boolean;
  pawCount: number;
  comments: Comment[];
  targetBreedId?: string;
  extraData?: {
    litterDetails?: {
      sire: string;
      dam: string;
      expectedDate: string;
      availablePuppies: number;
      healthTests: string;
      status: "Intresseanmälan öppen" | "Fullbokad" | "Valpar födda" | string;
      puppyList?: {
        name: string;
        gender: "Hane" | "Tik";
        color: string;
        image: string;
        status?: "Ledig" | "Tingad" | "Reserverad";
      }[];
    };
    playdateDetails?: {
      preferredDate: string;
      parkArea: string;
      dogName: string;
      dogBreed: string;
      sizePreference: string;
      energyLevel: "Hög energi" | "Lugn & sansad" | "Valpsällskap";
    };
    dogSittingDetails?: {
      type: "SÖKER_HUNDVAKT" | "ERBJUDER_PASSNING";
      dates: string;
      area: string;
      ratePerDaySEK: number;
      dogName?: string;
      requirements: string;
    };
    sponsoredAd?: {
      productTitle: string;
      sponsor: string;
      rating: number;
      reviewsCount: number;
      priceSEK: string;
      badge: string;
      amazonAffiliateLink: string;
      dealText: string;
    };
    aiBot?: {
      botName: string;
      model: string;
      tailoredForDogName: string;
      tailoredForBreed: string;
      confidenceScore: number;
      topic: string;
    };
  };
}

export interface DogMateProfile {
  id: string;
  dogName: string;
  registeredName: string;
  breedId: string;
  breedName: string;
  age: string;
  gender: "Hane" | "Tik";
  ownerName: string;
  ownerAvatar: string;
  city: string;
  area: string;
  image: string;
  energyLevel: "Lugn" | "Medel" | "Mycket lekfull & energisk";
  friendlyWith: string[];
  about: string;
  distanceKm: number;
}

export interface DogSitterProfile {
  id: string;
  name: string;
  avatar: string;
  city: string;
  area: string;
  ratePerDaySEK: number;
  rating: number;
  reviewsCount: number;
  verifiedId: boolean;
  experienceYears: number;
  homeType: string;
  acceptsBreeds: string[];
  bio: string;
  badge: string;
}

// Clean Initial Profiles
export const DEFAULT_PROFILES: Record<UserRole, UserProfile> = {
  DOG_OWNER: {
    id: "guest-owner",
    name: "Hundägare",
    role: "DOG_OWNER",
    avatar: "",
    location: "Sverige",
    city: "Stockholm",
    bio: "Skapa ett konto för att registrera dina hundar, hitta lekträffar och hundvakt.",
    verified: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    dogs: [],
  },
  BREEDER: {
    id: "guest-breeder",
    name: "Kennel / Uppfödare",
    role: "BREEDER",
    avatar: "",
    location: "Sverige",
    city: "Sverige",
    bio: "Registrera din kennel för att publicera avelsplaner och verifiera hälsotester.",
    verified: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  SEEKING_DOG: {
    id: "guest-seeker",
    name: "Vill skaffa hund",
    role: "SEEKING_DOG",
    avatar: "",
    location: "Sverige",
    city: "Sverige",
    bio: "Letar efter framtida valp eller hund från seriösa uppfödare.",
    verified: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    prospectiveInfo: {
      interestedBreeds: [],
      livingSituation: "",
      experience: "",
      timeframe: "Söker valp",
      notes: "",
    },
  },
};

// Generator function for personalized breed insights and expert tips (AI is completely hidden)
export function generateRandomAIPost(dogName: string, breedName: string): Post {
  const topics = [
    {
      title: "Mental Aktivering & Berikning",
      text: `💡 Rasinsikt för ${dogName}: Enligt rasstudier av ${breedName} behöver hunden inte bara fysisk motion utan djup nosberikning. Testa att gömma torkad anka eller lamm i en ihoprullad handduk med knutar. Detta sänker stresshormonet kortisol och ger hunden naturlig tillfredsställelse!`,
      tags: ["#MentalAktivering", `#${breedName.replace(/\s+/g, "")}`, "#Hundträning", "#Berikning"],
      badge: "Berikning & Hjärngympa",
    },
    {
      title: "Väder & Ledskydd för Nordisk Vinter",
      text: `❄️ Vinterråd för ${dogName}: Temperaturerna sjunker nu i Sverige. Medan ${breedName} har fantastisk vinterpäls är vägsalt och isklumpar mellan trampdynorna vanliga orsaker till hälta. Smörj tassarna med ekologiskt tassvax innan skogspromenaden!`,
      tags: ["#Tassvård", "#Vinterhund", "#NordisktKlimat", "#PawCare"],
      badge: "Vinterhälsa & Tassar",
    },
    {
      title: "Urhundens Språk & Signaler",
      text: `🐕 Språk & Beteende: ${breedName} använder mer subtila dämpande signaler än många moderna bruksraser (sidosnegling, långsamma blinkningar, nosfrysning). När ${dogName} fryser till vid ett möte är det inte envishet — det är en artig inbromsning för att läsa av motpartens energi. Ge din hund tid!`,
      tags: ["#Hundspråk", "#Urhundsbeteende", "#Etologi", "#PositivTräning"],
      badge: "Beteendevetenskap",
    },
    {
      title: "Ernährung & Färskfoder Balans",
      text: `🥩 Näringsguide för ${dogName}: Många asiatiska spetsar härstammar från kust- och bergsregioner med hög andel fisk och vilt. Om ${dogName} visar tendens till klåda eller kräsenhet: rotera proteinkällor mot lax, ren eller vilt och undvik vete/majsfyllmedel.`,
      tags: ["#Hundnäring", "#Foderguide", "#Allergifritt", "#Hundhälsa"],
      badge: "Näringsanalys",
    },
  ];

  const chosen = topics[Math.floor(Math.random() * topics.length)];

  return {
    id: `tip-post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    authorId: "urhund-redaktionen",
    authorName: "Urhund Guiden",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    authorRole: "BREEDER",
    authorBadge: `Expertråd • ${chosen.badge}`,
    city: "Sverige",
    timestamp: "Just nu",
    postType: "STATUS",
    content: chosen.text,
    tags: chosen.tags,
    likes: 0,
    pawCount: 0,
    hasLiked: false,
    comments: [],
  };
}
