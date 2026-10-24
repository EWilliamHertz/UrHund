"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  User,
  Award,
  Heart,
  ShieldCheck,
  MapPin,
  Globe2,
  Sparkles,
  ArrowRight,
  X,
  Loader2,
  Search,
  Plus,
  Trash2,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { UserRole, UserProfile, DogItem } from "@/data/mockSocial";
import { ALL_WORLD_BREEDS, WorldBreed } from "@/data/allWorldBreeds";

interface AuthModalProps {
  isOpen: boolean;
  role: UserRole;
  onSuccess: (profile: UserProfile) => void;
  onClose: () => void;
  onSwitchRole: (newRole: UserRole) => void;
}

interface DogDraft {
  id: string;
  name: string;
  breedId: string;
  breedName: string;
  age: string;
  gender: "Hane" | "Tik";
  color: string;
  image: string;
  healthStatus: string;
}

interface DesiredDogDraft {
  id: string;
  breedName: string;
  breedId: string;
  years: string;
  status: string;
  notes?: string;
}

export function AuthModal({
  isOpen,
  role,
  onSuccess,
  onClose,
  onSwitchRole,
}: AuthModalProps) {
  const [mode, setMode] = useState<"REGISTER" | "LOGIN">("REGISTER");

  // User credentials & personal info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Falköping");
  const [avatar, setAvatar] = useState("");

  // Dogs list (supports MULTIPLE dogs!)
  const [dogs, setDogs] = useState<DogDraft[]>([
    {
      id: "dog-draft-1",
      name: "",
      breedId: "shiba-inu",
      breedName: "Shiba Inu",
      age: "2 år",
      gender: "Hane",
      color: "Röd",
      image: "",
      healthStatus: "Hälsokontrollerad (SKK)",
    },
  ]);

  // Active breed search in form
  const [activeDogIndexSearch, setActiveDogIndexSearch] = useState<number | null>(null);
  const [breedSearchQuery, setBreedSearchQuery] = useState("");

  // Breeder specific fields
  const [kennelName, setKennelName] = useState("");
  const [kennelPrefix, setKennelPrefix] = useState("");
  const [breederBreed, setBreederBreed] = useState("Shiba Inu");
  const [registry, setRegistry] = useState<"SKK (Sverige)" | "NIPPO (Japan)" | "FCI (Europa)">("SKK (Sverige)");
  const [website, setWebsite] = useState("");
  const [isBreederBreedSearchOpen, setIsBreederBreedSearchOpen] = useState(false);

  // Seeking Dog specific fields (supports multiple desired dogs & custom timeline!)
  const [desiredDogs, setDesiredDogs] = useState<DesiredDogDraft[]>([
    {
      id: "desired-1",
      breedName: "Tibetansk Mastiff (Do-Khyi)",
      breedId: "tibetan-mastiff",
      years: "2030 / 2031",
      status: "Förbereder och planerar tills dess",
      notes: "",
    },
  ]);
  const [activeDesiredDogIndexSearch, setActiveDesiredDogIndexSearch] = useState<number | null>(null);
  const [desiredDogBreedQuery, setDesiredDogBreedQuery] = useState("");
  const [livingSituation, setLivingSituation] = useState("Villa med inhägnad tomt");
  const [experience, setExperience] = useState("Haft hund tidigare");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtered breeds based on query
  const filteredBreeds = breedSearchQuery.trim()
    ? ALL_WORLD_BREEDS.filter(
        (b) =>
          b.name.toLowerCase().includes(breedSearchQuery.toLowerCase()) ||
          b.nameEn.toLowerCase().includes(breedSearchQuery.toLowerCase()) ||
          b.origin.toLowerCase().includes(breedSearchQuery.toLowerCase())
      ).slice(0, 8)
    : ALL_WORLD_BREEDS.slice(0, 8);

  // File upload helper for user avatar
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // File upload helper for a specific dog's picture
  const handleDogImageFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const updated = [...dogs];
        updated[index].image = event.target.result as string;
        setDogs(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add another dog to the profile
  const handleAddAnotherDog = () => {
    setDogs([
      ...dogs,
      {
        id: `dog-${Date.now()}-${dogs.length + 1}`,
        name: "",
        breedId: "shiba-inu",
        breedName: "Shiba Inu",
        age: "1 år",
        gender: "Tik",
        color: "",
        image: "",
        healthStatus: "Hälsokontrollerad",
      },
    ]);
  };

  // Remove a dog from the list
  const handleRemoveDog = (index: number) => {
    if (dogs.length <= 1) return;
    setDogs(dogs.filter((_, i) => i !== index));
  };

  // Update dog draft property
  const handleUpdateDog = (index: number, field: keyof DogDraft, value: string) => {
    const updated = [...dogs];
    // @ts-expect-error dynamic key assignment
    updated[index][field] = value;
    setDogs(updated);
  };

  // Desired dogs helpers (for prospective owners seeking multiple breeds/timelines)
  const handleAddDesiredDog = () => {
    setDesiredDogs((prev) => [
      ...prev,
      {
        id: `desired-${Date.now()}-${prev.length + 1}`,
        breedName: "Shiba Inu",
        breedId: "shiba-inu",
        years: "2032 / 2033",
        status: "Förbereder tills dess",
        notes: "",
      },
    ]);
  };

  const handleRemoveDesiredDog = (index: number) => {
    if (desiredDogs.length <= 1) return;
    setDesiredDogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDesiredDog = (index: number, field: keyof DesiredDogDraft, value: string) => {
    setDesiredDogs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const filteredDesiredBreeds = desiredDogBreedQuery.trim()
    ? ALL_WORLD_BREEDS.filter(
        (b) =>
          b.name.toLowerCase().includes(desiredDogBreedQuery.toLowerCase()) ||
          b.nameEn.toLowerCase().includes(desiredDogBreedQuery.toLowerCase()) ||
          b.origin.toLowerCase().includes(desiredDogBreedQuery.toLowerCase())
      ).slice(0, 8)
    : ALL_WORLD_BREEDS.slice(0, 8);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === "LOGIN") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Inloggningen misslyckades.");
        }

        onSuccess(data.profile);
      } else {
        // Register Mode
        const finalDogs: DogItem[] = dogs.map((d) => ({
          id: d.id,
          name: d.name || "Min Hund",
          breedId: d.breedId,
          breedName: d.breedName,
          age: d.age || "2 år",
          gender: d.gender,
          color: d.color || "Röd",
          image: d.image || "",
          healthStatus: d.healthStatus || "Hälsokontrollerad",
          traits: ["Vänlig", "Lojal"],
          bio: `${d.name || "Hunden"} gillar skogspromenader och lekträffar.`,
          lookingFor: ["MATES", "SITTING"],
        }));

        const payload: Record<string, unknown> = {
          email,
          password,
          name: role === "BREEDER" ? (kennelName || name) : name,
          role,
          city,
          location: city,
          avatar: avatar || "",
        };

        if (role === "DOG_OWNER") {
          payload.dog = finalDogs[0];
          payload.dogs = finalDogs;
        } else if (role === "BREEDER") {
          payload.registry = registry;
          payload.kennel = {
            id: `kennel-${Date.now()}`,
            name: kennelName || name,
            prefix: kennelPrefix,
            establishedYear: new Date().getFullYear(),
            breeds: [breederBreed],
            plannedLitters: "Planerad kull",
            website,
          };
        } else if (role === "SEEKING_DOG") {
          payload.prospectiveInfo = {
            desiredDogs: desiredDogs.map((d) => ({
              id: d.id,
              breedName: d.breedName,
              breedId: d.breedId,
              years: d.years,
              timeframe: `Söker denna hundrasen vid; ${d.years}`,
              preparationStatus: d.status,
              notes: d.notes || "",
            })),
            interestedBreeds: desiredDogs.map((d) => d.breedName),
            livingSituation,
            experience,
            timeframe: desiredDogs[0] ? `Söker denna hundrasen vid; ${desiredDogs[0].years}` : "Söker hund",
            notes: desiredDogs.map((d) => `${d.breedName} (${d.years}: ${d.status})`).join(" • "),
          };
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registreringen misslyckades.");
        }

        onSuccess(data.profile);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ett fel uppstod.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-zinc-950/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/95 p-6 md:p-8 shadow-2xl shadow-black my-auto max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-400 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Urhund.se Medlemskap</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {mode === "REGISTER" ? "Skapa ditt konto" : "Logga in på Urhund.se"}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {mode === "REGISTER"
                ? "Anslut till Sveriges ledande mötesplats för hundägare och uppfödare"
                : "Välkommen tillbaka! Ange dina inloggningsuppgifter"}
            </p>
          </div>

          {/* Role Tabs for Register Mode */}
          {mode === "REGISTER" && (
            <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-950 p-1.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => onSwitchRole("DOG_OWNER")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  role === "DOG_OWNER"
                    ? "bg-emerald-500 text-zinc-950 shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                <span>Hundägare</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole("BREEDER")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  role === "BREEDER"
                    ? "bg-amber-500 text-zinc-950 shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Kennel</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole("SEEKING_DOG")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  role === "SEEKING_DOG"
                    ? "bg-cyan-500 text-zinc-950 shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Vill skaffa hund</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Information */}
            <div className="space-y-3">
              {mode === "REGISTER" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1">
                      {role === "BREEDER" ? "Kennelnamn / Ansvarig" : "Ditt Namn"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder={role === "BREEDER" ? "Kennel Hagakure / Anna Svensson" : "Ernst-William"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1">
                      Stad / Ort
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder="T.ex. Falköping, Göteborg..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Picture Upload for user */}
              {mode === "REGISTER" && (
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profilbild"
                        className="h-11 w-11 rounded-xl object-cover border border-amber-500/50"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-white">Din Profilbild</p>
                      <p className="text-[10px] text-zinc-400">Välj foto på dig själv eller logotyp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-amber-400" />
                      <span>Välj bild</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>

                    <label className="cursor-pointer rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1.5" title="Ta foto med kamera">
                      <Camera className="h-3.5 w-3.5" />
                      <span>Kamera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1">
                    E-postadress
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="din@epost.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-1">
                    Lösenord
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="password"
                      required
                      placeholder="Minst 6 tecken"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Role Specific Registration Fields */}
            {mode === "REGISTER" && role === "DOG_OWNER" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Heart className="h-4 w-4" />
                    Mina Hundar ({dogs.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAnotherDog}
                    className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Lägg till ytterligare en hund</span>
                  </button>
                </div>

                {dogs.map((dogDraft, index) => (
                  <div
                    key={dogDraft.id}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 relative"
                  >
                    {dogs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDog(index)}
                        className="absolute top-3 right-3 text-zinc-500 hover:text-rose-400 transition"
                        title="Ta bort denna hund"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div className="text-[11px] font-bold text-emerald-300">
                      Hund #{index + 1}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      {/* Dog Name */}
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Hundens Namn *</label>
                        <input
                          type="text"
                          required
                          placeholder="T.ex. Huang, Kuma, Kenji..."
                          value={dogDraft.name}
                          onChange={(e) => handleUpdateDog(index, "name", e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Dog Age */}
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Ålder</label>
                        <input
                          type="text"
                          placeholder="T.ex. 2 år / 6 månader"
                          value={dogDraft.age}
                          onChange={(e) => handleUpdateDog(index, "age", e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Kön</label>
                        <select
                          value={dogDraft.gender}
                          onChange={(e) => handleUpdateDog(index, "gender", e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="Hane">Hane</option>
                          <option value="Tik">Tik</option>
                        </select>
                      </div>
                    </div>

                    {/* Breed Search among all world dogs */}
                    <div className="relative">
                      <label className="text-[10px] text-zinc-400 block mb-1">
                        Ras (Sök bland världens alla hundraser)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Sök t.ex. Shiba, Mastiff, Golden, Jämthund, Husky..."
                            value={activeDogIndexSearch === index ? breedSearchQuery : dogDraft.breedName}
                            onFocus={() => {
                              setActiveDogIndexSearch(index);
                              setBreedSearchQuery("");
                            }}
                            onChange={(e) => {
                              setActiveDogIndexSearch(index);
                              setBreedSearchQuery(e.target.value);
                            }}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Breed Autocomplete Dropdown */}
                      {activeDogIndexSearch === index && (
                        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
                          <div className="p-1 text-[10px] text-zinc-400 uppercase font-semibold">
                            Välj från alla världens raser ({ALL_WORLD_BREEDS.length} tillgängliga)
                          </div>
                          {filteredBreeds.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                handleUpdateDog(index, "breedId", b.id);
                                handleUpdateDog(index, "breedName", b.name);
                                setActiveDogIndexSearch(null);
                              }}
                              className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-200 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                            >
                              <span className="font-semibold">{b.name}</span>
                              <span className="text-[10px] text-zinc-400">
                                {b.origin} • {b.group}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dog Picture Selector / Uploader */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {dogDraft.image ? (
                          <img
                            src={dogDraft.image}
                            alt={dogDraft.name || "Hund"}
                            className="h-10 w-10 rounded-lg object-cover border border-emerald-500"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-[11px] font-semibold text-white">Foto på {dogDraft.name || "hunden"}</p>
                          <p className="text-[10px] text-zinc-400">
                            {dogDraft.image ? "Foto valt och sparat" : "Välj foto från mobil/dator"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {dogDraft.image && (
                          <button
                            type="button"
                            onClick={() => handleUpdateDog(index, "image", "")}
                            className="text-[11px] text-zinc-400 hover:text-rose-400 transition"
                          >
                            Rensa
                          </button>
                        )}
                        <label className="cursor-pointer rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1">
                          <Upload className="h-3 w-3" />
                          <span>Ladda upp bild</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDogImageFileUpload(index, e)}
                            className="hidden"
                          />
                        </label>

                        <label className="cursor-pointer rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1" title="Ta foto med kamera">
                          <Camera className="h-3 w-3" />
                          <span>Kamera</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleDogImageFileUpload(index, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Role Specific: Breeder */}
            {mode === "REGISTER" && role === "BREEDER" && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  Kennel- & Uppfödarprofil
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Kennelnamn *</label>
                    <input
                      type="text"
                      required
                      placeholder="T.ex. Kennel Hagakure Nord"
                      value={kennelName}
                      onChange={(e) => setKennelName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Kennelprefix / Registrerat namn</label>
                    <input
                      type="text"
                      placeholder="T.ex. Hagakure"
                      value={kennelPrefix}
                      onChange={(e) => setKennelPrefix(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Avelsklubb / Register</label>
                    <select
                      value={registry}
                      onChange={(e) =>
                        setRegistry(e.target.value as "SKK (Sverige)" | "NIPPO (Japan)" | "FCI (Europa)")
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="SKK (Sverige)">SKK (Sverige)</option>
                      <option value="NIPPO (Japan)">NIPPO (Japan)</option>
                      <option value="FCI (Europa)">FCI (Europa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Hemsida / Länk</label>
                    <input
                      type="url"
                      placeholder="https://minkennel.se"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Role Specific: Seeking Dog */}
            {mode === "REGISTER" && role === "SEEKING_DOG" && (
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Search className="h-4 w-4" />
                    Mina Önskemål inför Valpköp (Planerade Raser)
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {desiredDogs.length} {desiredDogs.length === 1 ? "ras vald" : "raser valda"}
                  </span>
                </div>

                <div className="space-y-3">
                  {desiredDogs.map((dDog, idx) => (
                    <div
                      key={dDog.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          🐾 Önskad hundras #{idx + 1}
                        </span>
                        {desiredDogs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDesiredDog(idx)}
                            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-0.5 rounded-lg border border-rose-500/20 hover:border-rose-500/40"
                          >
                            <Trash2 className="h-3 w-3" />
                            Ta bort
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Breed selector */}
                        <div className="relative">
                          <label className="text-[10px] text-zinc-400 block mb-1">Hundras du söker</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={dDog.breedName}
                              onChange={(e) => handleUpdateDesiredDog(idx, "breedName", e.target.value)}
                              placeholder="T.ex. Tibetansk Mastiff, Shiba Inu..."
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveDesiredDogIndexSearch(activeDesiredDogIndexSearch === idx ? null : idx);
                                setDesiredDogBreedQuery("");
                              }}
                              className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-xl hover:bg-cyan-500/20 text-xs shrink-0"
                              title="Sök i världsregistret"
                            >
                              Bläddra
                            </button>
                          </div>

                          {/* Breed dropdown */}
                          {activeDesiredDogIndexSearch === idx && (
                            <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-xl space-y-1">
                              <input
                                type="text"
                                placeholder="Filtrera bland världens raser..."
                                value={desiredDogBreedQuery}
                                onChange={(e) => setDesiredDogBreedQuery(e.target.value)}
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white mb-1.5 focus:outline-none"
                                autoFocus
                              />
                              {filteredDesiredBreeds.map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateDesiredDog(idx, "breedName", b.name);
                                    handleUpdateDesiredDog(idx, "breedId", b.id);
                                    setActiveDesiredDogIndexSearch(null);
                                  }}
                                  className="w-full flex items-center justify-between p-1.5 text-left rounded hover:bg-zinc-800 text-xs text-zinc-200"
                                >
                                  <span>{b.name}</span>
                                  <span className="text-[10px] text-zinc-500">{b.origin}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Söker denna hundrasen vid: XXXX / XXXX */}
                        <div>
                          <label className="text-[10px] text-cyan-300 font-semibold block mb-1">
                            Söker denna hundrasen vid; (Tidsintervall)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={dDog.years}
                              onChange={(e) => handleUpdateDesiredDog(idx, "years", e.target.value)}
                              placeholder="T.ex. 2030 / 2031"
                              className="w-full rounded-xl border border-cyan-500/40 bg-zinc-900 px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-400"
                            />
                            <div className="flex gap-1.5 mt-1.5 overflow-x-auto">
                              {["2026 / 2027", "2028 / 2029", "2030 / 2031", "2032 / 2033"].map((quickYear) => (
                                <button
                                  key={quickYear}
                                  type="button"
                                  onClick={() => handleUpdateDesiredDog(idx, "years", quickYear)}
                                  className={`text-[9px] px-1.5 py-0.5 rounded border transition ${
                                    dDog.years === quickYear
                                      ? "bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold"
                                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                                  }`}
                                >
                                  {quickYear}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Förberedelsestatus */}
                        <div className="md:col-span-2">
                          <label className="text-[10px] text-zinc-400 block mb-1">
                            Status / Förberedelser inför denna ras
                          </label>
                          <select
                            value={dDog.status}
                            onChange={(e) => handleUpdateDesiredDog(idx, "status", e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="Förbereder och planerar tills dess">Förbereder och planerar tills dess</option>
                            <option value="Förbereder tills då (går kurser & hälsar på uppfödare)">Förbereder tills då (går kurser & hälsar på uppfödare)</option>
                            <option value="Aktivt sökande efter kull & kennel">Aktivt sökande efter kull & kennel</option>
                            <option value="Ställt mig i valpkö hos kennel">Ställt mig i valpkö hos kennel</option>
                            <option value="Redo om rätt valp/föräldradjur dyker upp">Redo om rätt valp/föräldradjur dyker upp</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add another desired breed button */}
                <button
                  type="button"
                  onClick={handleAddDesiredDog}
                  className="w-full rounded-xl border border-dashed border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Lägg till ytterligare ras du söker (T.ex. Shiba Inu vid 2032 / 2033)</span>
                </button>

                {/* Living and Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Boendesituation</label>
                    <select
                      value={livingSituation}
                      onChange={(e) => setLivingSituation(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Villa med inhägnad tomt">Villa med inhägnad tomt</option>
                      <option value="Lägenhet nära skog och natur">Lägenhet nära skog och natur</option>
                      <option value="Gård på landet">Gård på landet</option>
                      <option value="Radhus med trädgård">Radhus med trädgård</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Hundvana</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Förstagångsägare">Förstagångsägare</option>
                      <option value="Haft hund tidigare">Haft hund tidigare</option>
                      <option value="Erfaren med urhundar/spetsar">Erfaren med urhundar/spetsar</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sparar uppgifter...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === "REGISTER"
                      ? role === "BREEDER"
                        ? "Registrera Kennel & Börja Avelsflödet"
                        : role === "SEEKING_DOG"
                        ? "Skapa Konto & Hitta Valp"
                        : "Registrera Konto & Mina Hundar"
                      : "Logga in på kontot"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Register and Login */}
          <div className="mt-6 text-center border-t border-zinc-800/80 pt-4">
            {mode === "REGISTER" ? (
              <p className="text-xs text-zinc-400">
                Har du redan ett konto?{" "}
                <button
                  type="button"
                  onClick={() => setMode("LOGIN")}
                  className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition"
                >
                  Logga in här
                </button>
              </p>
            ) : (
              <p className="text-xs text-zinc-400">
                Har du inget konto än?{" "}
                <button
                  type="button"
                  onClick={() => setMode("REGISTER")}
                  className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition"
                >
                  Skapa ett konto nu
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
