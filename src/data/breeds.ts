export interface HealthCheck {
  name: string;
  code: string;
  importance: "Kritisk" | "Rekommenderad";
  description: string;
}

export interface Breed {
  id: string;
  name: string;
  nativeName: string;
  origin: string;
  fciGroup: string;
  tagline: string;
  description: string;
  image: string;
  stats: {
    height: string;
    weight: string;
    lifespan: string;
    monthlyInsuranceSEK: string;
    exerciseHoursPerDay: number;
  };
  traits: {
    independence: number;
    guardInstinct: number;
    preyDrive: number;
    grooming: number;
    firstTimeFriendly: number;
    winterTolerance: number;
  };
  coatColors: { name: string; hex: string }[];
  healthChecks: HealthCheck[];
}

export interface LitterPuppy {
  name: string;
  gender: "Hane" | "Tik";
  color: string;
  image: string;
  status?: "Ledig" | "Tingad" | "Reserverad";
}

export interface KennelLitter {
  name: string;
  litterPhoto: string;
  birthDate?: string;
  status: string;
  puppies: LitterPuppy[];
}

export interface Kennel {
  id: string;
  name: string;
  breedIds: string[];
  country: string;
  city: string;
  registry: "SKK (Sverige)" | "NIPPO (Japan)" | "FCI (Europa)" | "Export / Internationell" | string;
  verifiedHealthTests: boolean;
  planningLitter: boolean;
  nextLitterEstimate?: string;
  website?: string | null;
  kopahundUrl?: string | null;
  clubUrl?: string | null;
  phone?: string | null;
  litters?: KennelLitter[];
  claimed?: boolean;
  claimedBy?: string | null;
  contactEmail?: string | null;
  description?: string;
  image?: string | null;
  photos?: string[];
}
