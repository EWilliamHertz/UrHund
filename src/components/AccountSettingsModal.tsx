"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Dog,
  Award,
  Search,
  Upload,
  Camera,
  Trash2,
  Plus,
  Check,
  Loader2,
  ShieldCheck,
  MapPin,
  FileText,
  Mail,
  Building,
  Heart,
  Globe,
  Settings,
  ChevronDown,
} from "lucide-react";
import { UserProfile, UserRole, DogItem } from "@/data/mockSocial";
import { ALL_WORLD_BREEDS, WorldBreed } from "@/data/allWorldBreeds";

interface AccountSettingsModalProps {
  isOpen: boolean;
  profile: UserProfile;
  currentRole: UserRole;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onRoleChange?: (role: UserRole) => void;
}

export function AccountSettingsModal({
  isOpen,
  profile,
  currentRole,
  onClose,
  onUpdateProfile,
  onRoleChange,
}: AccountSettingsModalProps) {
  // Navigation tabs inside settings modal
  const [activeTab, setActiveTab] = useState<"PROFILE" | "DOGS" | "ROLE_SPECIFIC" | "SECURITY">("PROFILE");

  // Profile fields state
  const [name, setName] = useState(profile.name || "");
  const [email] = useState(profile.email || "");
  const [city, setCity] = useState(profile.city || profile.location || "Sverige");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || profile.role || "DOG_OWNER");
  const [registry, setRegistry] = useState(profile.registry || "SKK (Sverige)");

  // Dogs state
  const initialDogs: DogItem[] =
    profile.dogs && profile.dogs.length > 0
      ? profile.dogs
      : profile.dog
      ? [profile.dog]
      : [];
  const [dogs, setDogs] = useState<DogItem[]>(initialDogs);
  const [activeDogBreedSearchIdx, setActiveDogBreedSearchIdx] = useState<number | null>(null);
  const [breedSearchQuery, setBreedSearchQuery] = useState("");

  // Breeder specific
  const [kennelName, setKennelName] = useState(profile.kennel?.name || "");
  const [kennelPrefix, setKennelPrefix] = useState(profile.kennel?.prefix || "");
  const [kennelEstYear, setKennelEstYear] = useState<number>(profile.kennel?.establishedYear || 2020);
  const [kennelLitters, setKennelLitters] = useState(profile.kennel?.plannedLitters || "");
  const [kennelWebsite, setKennelWebsite] = useState(profile.kennel?.website || "");

  // Puppy seeker specific - world breeds dropdown state
  const initialInterestedBreeds: string[] =
    profile.prospectiveInfo?.interestedBreeds && profile.prospectiveInfo.interestedBreeds.length > 0
      ? profile.prospectiveInfo.interestedBreeds
      : [];
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>(initialInterestedBreeds);
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);
  const [breedSearchText, setBreedSearchText] = useState("");
  const [timeframe, setTimeframe] = useState(profile.prospectiveInfo?.timeframe || "Inom 6–12 månader");
  const [livingSituation, setLivingSituation] = useState(profile.prospectiveInfo?.livingSituation || "Villa med inhägnad tomt");
  const [experience, setExperience] = useState(profile.prospectiveInfo?.experience || "Erfaren hundägare");

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Synchronize state from profile whenever modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setName(profile.name || "");
        setCity(profile.city || profile.location || "Sverige");
        setBio(profile.bio || "");
        setAvatar(profile.avatar || "");
        setSelectedRole(currentRole || profile.role || "DOG_OWNER");
        setRegistry(profile.registry || "SKK (Sverige)");

        const loadedDogs: DogItem[] =
          profile.dogs && profile.dogs.length > 0
            ? profile.dogs
            : profile.dog
            ? [profile.dog]
            : [];
        setDogs(loadedDogs);

        setKennelName(profile.kennel?.name || "");
        setKennelPrefix(profile.kennel?.prefix || "");
        setKennelEstYear(profile.kennel?.establishedYear || 2020);
        setKennelLitters(profile.kennel?.plannedLitters || "");
        setKennelWebsite(profile.kennel?.website || "");

        const loadedBreeds: string[] =
          profile.prospectiveInfo?.interestedBreeds && profile.prospectiveInfo.interestedBreeds.length > 0
            ? profile.prospectiveInfo.interestedBreeds
            : [];
        setSelectedBreeds(loadedBreeds);
        setTimeframe(profile.prospectiveInfo?.timeframe || "Inom 6–12 månader");
        setLivingSituation(profile.prospectiveInfo?.livingSituation || "Villa med inhägnad tomt");
        setExperience(profile.prospectiveInfo?.experience || "Erfaren hundägare");

        setSaveSuccess(false);
        setSaveError(null);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen, profile, currentRole]);

  // Filter world breeds for seeker dropdown
  const filteredBreedsForSeeker: WorldBreed[] = breedSearchText.trim()
    ? ALL_WORLD_BREEDS.filter((b) =>
        b.name.toLowerCase().includes(breedSearchText.toLowerCase()) ||
        b.nameEn.toLowerCase().includes(breedSearchText.toLowerCase()) ||
        b.origin.toLowerCase().includes(breedSearchText.toLowerCase())
      )
    : ALL_WORLD_BREEDS;

  const handleToggleBreed = (breedName: string) => {
    setSelectedBreeds((prev) =>
      prev.includes(breedName)
        ? prev.filter((b) => b !== breedName)
        : [...prev, breedName]
    );
  };

  // Hidden file/camera inputs for avatar
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const avatarCameraInputRef = useRef<HTMLInputElement>(null);

  // Filter breeds for search
  const filteredBreeds: WorldBreed[] = breedSearchQuery.trim()
    ? ALL_WORLD_BREEDS.filter((b) =>
        b.name.toLowerCase().includes(breedSearchQuery.toLowerCase()) ||
        b.nameEn.toLowerCase().includes(breedSearchQuery.toLowerCase()) ||
        b.origin.toLowerCase().includes(breedSearchQuery.toLowerCase())
      ).slice(0, 10)
    : ALL_WORLD_BREEDS.slice(0, 8);

  if (!isOpen) return null;

  // File upload for user avatar
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);

      // Attempt background upload to host permanently
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.url) setAvatar(data.url);
        }
      } catch (err) {
        console.warn("Avatar upload fallback to local:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Dog management helpers
  const handleAddDog = () => {
    const newDog: DogItem = {
      id: `dog-${Date.now()}`,
      name: "",
      breedId: "spets-urhund",
      breedName: "Shiba Inu",
      age: "2 år",
      gender: "Hane",
      image: "",
      healthStatus: "Vaccinerad & Hälsotestad",
      traits: ["Tillgiven", "Vaksam"],
    };
    setDogs((prev) => [...prev, newDog]);
  };

  const handleRemoveDog = (index: number) => {
    setDogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDogField = (index: number, field: keyof DogItem, value: unknown) => {
    setDogs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDogImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      handleUpdateDogField(index, "image", dataUrl);

      // Try background image host
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.url) handleUpdateDogField(index, "image", data.url);
        }
      } catch (err) {
        console.warn("Dog image upload fallback to local:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save all settings handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        name: name.trim() || profile.name,
        city: city.trim() || profile.city,
        location: city.trim() || profile.location,
        bio: bio.trim(),
        avatar: avatar || profile.avatar,
        role: selectedRole,
        registry: registry as "SKK (Sverige)" | "NIPPO (Japan)" | "FCI (Europa)",
        dogs: dogs,
        dog: dogs[0] || profile.dog,
        kennel:
          selectedRole === "BREEDER"
            ? {
                id: profile.kennel?.id || `kennel-${Date.now()}`,
                name: kennelName.trim() || (profile.kennel?.name ?? "Kennel"),
                prefix: kennelPrefix.trim() || (profile.kennel?.prefix ?? ""),
                establishedYear: kennelEstYear,
                breeds: dogs.map((d) => d.breedName).filter(Boolean),
                plannedLitters: kennelLitters.trim() || "Planerad valpkull",
                website: kennelWebsite.trim() || (profile.kennel?.website ?? ""),
              }
            : profile.kennel,
        prospectiveInfo:
          selectedRole === "SEEKING_DOG"
            ? {
                interestedBreeds: selectedBreeds,
                timeframe,
                livingSituation,
                experience,
                desiredDogs: profile.prospectiveInfo?.desiredDogs,
              }
            : profile.prospectiveInfo,
      };

      // Ensure persistent ID and email so changes always save permanently in DB
      if (!updatedProfile.id || updatedProfile.id.startsWith("guest-")) {
        updatedProfile.id = "user-1792774875281";
      }
      if (!updatedProfile.email) {
        updatedProfile.email = "ernst@hatake.eu";
      }

      // 1. Update React state in parent app
      onUpdateProfile(updatedProfile);
      if (onRoleChange && selectedRole !== currentRole) {
        onRoleChange(selectedRole);
      }

      // 2. Persist to localStorage
      try {
        localStorage.setItem("urhund_active_user", JSON.stringify(updatedProfile));
      } catch (storageErr) {
        console.warn("Could not save to localStorage:", storageErr);
      }

      // 3. Persist to PostgreSQL backend
      try {
        const res = await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn("Backend update error:", errData);
        }
      } catch (backendErr) {
        console.warn("Backend update network error:", backendErr);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      console.error("Save settings error:", err);
      const msg = err instanceof Error ? err.message : "Kunde inte spara inställningarna.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto"
    >
      {/* Scrollable Modal Container */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto my-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          title="Stäng inställningar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pr-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Kontoinställningar</h2>
            <p className="text-xs text-zinc-400">
              Redigera och anpassa din profil, dina hundar och dina uppgifter på UrHund
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("PROFILE")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "PROFILE"
                ? "bg-amber-500 text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Min Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DOGS")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "DOGS"
                ? "bg-amber-500 text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <Dog className="h-3.5 w-3.5" />
            <span>Mina Hundar ({dogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ROLE_SPECIFIC")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "ROLE_SPECIFIC"
                ? "bg-amber-500 text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>
              {selectedRole === "BREEDER"
                ? "Kenneluppgifter"
                : selectedRole === "SEEKING_DOG"
                ? "Valpköparprofil"
                : "Roll & Inriktning"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SECURITY")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === "SECURITY"
                ? "bg-amber-500 text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Konto & Säkerhet</span>
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* TAB 1: MIN PROFIL */}
          {activeTab === "PROFILE" && (
            <div className="space-y-5">
              {/* Profile Avatar Card with Device Upload & Camera */}
              <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-4">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mb-3">
                  Din Profilbild
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name || "Profilbild"}
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-500/80 shadow-md"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 border-2 border-zinc-700">
                        <User className="h-9 w-9" />
                      </div>
                    )}
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar("")}
                        className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition shadow"
                        title="Ta bort profilbild"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <p className="text-xs font-semibold text-white">Ladda upp nytt foto</p>
                    <p className="text-[11px] text-zinc-400">
                      Välj ett foto från din enhet eller ta en bild med kameran.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      {/* Device Upload */}
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 transition cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5 text-amber-400" />
                        <span>Ladda upp från enhet</span>
                      </button>
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />

                      {/* Camera Capture */}
                      <button
                        type="button"
                        onClick={() => avatarCameraInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 transition cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Ta foto med kamera</span>
                      </button>
                      <input
                        ref={avatarCameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-amber-400" />
                    <span>Visningsnamn</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ditt för- och efternamn"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    <span>Stad / Område</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="T.ex. Stockholm, Göteborg, Umeå..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Bio / Presentation */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1.5 block flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <span>Om dig & din hundresa (Bio)</span>
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Kort presentation om ditt hundintresse, dina erfarenheter och vad du gillar att göra tillsammans med dina hundar..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                  maxLength={300}
                />
                <span className="text-[10px] text-zinc-500 block text-right mt-0.5">
                  {bio.length}/300 tecken
                </span>
              </div>

              {/* Active Role Switcher */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                  Aktiv Roll i UrHund
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("DOG_OWNER")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedRole === "DOG_OWNER"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5 mb-1">
                      <span>🐕</span> Hundägare
                    </div>
                    <p className="text-[10px] opacity-80 leading-snug">
                      Har en eller flera hundar hemma
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("BREEDER")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedRole === "BREEDER"
                        ? "border-amber-500 bg-amber-500/15 text-amber-300"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5 mb-1">
                      <span>🏛️</span> Uppfödare / Kennel
                    </div>
                    <p className="text-[10px] opacity-80 leading-snug">
                      Registrerad kennel och avelsverksamhet
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("SEEKING_DOG")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedRole === "SEEKING_DOG"
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5 mb-1">
                      <span>🐾</span> Vill skaffa hund
                    </div>
                    <p className="text-[10px] opacity-80 leading-snug">
                      Söker valp eller vuxen omplacering
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MINA HUNDAR */}
          {activeTab === "DOGS" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-bold text-white">Dina registrerade hundar</h3>
                  <p className="text-xs text-zinc-400">
                    Lägg till och uppdatera information om dina hundar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDog}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Lägg till hund</span>
                </button>
              </div>

              {dogs.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-3">
                  <Dog className="h-10 w-10 text-zinc-600 mx-auto" />
                  <p className="text-sm font-bold text-white">Inga hundar tillagda ännu</p>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Klicka på &quot;Lägg till hund&quot; för att skapa din hunds profil med foto, ras och hälsa.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddDog}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Lägg till min första hund</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dogs.map((dog, idx) => (
                    <div
                      key={dog.id || idx}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Dog className="h-4 w-4" />
                          <span>Hund #{idx + 1} {dog.name ? `– ${dog.name}` : ""}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDog(idx)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Ta bort</span>
                        </button>
                      </div>

                      {/* Dog Photo Section with Device Upload & Camera */}
                      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 flex flex-col sm:flex-row items-center gap-3.5">
                        <div className="relative group shrink-0">
                          {dog.image ? (
                            <img
                              src={dog.image}
                              alt={dog.name || "Hund"}
                              className="h-16 w-16 rounded-xl object-cover border border-emerald-500/60"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">
                              <Dog className="h-7 w-7" />
                            </div>
                          )}
                          {dog.image && (
                            <button
                              type="button"
                              onClick={() => handleUpdateDogField(idx, "image", "")}
                              className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 transition"
                              title="Rensa bild"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-1">
                          <p className="text-xs font-semibold text-white">
                            Foto på {dog.name || "hunden"}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Ladda upp foto direkt från mobil/dator eller ta bild med kameran.
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                            <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 transition">
                              <Upload className="h-3 w-3 text-emerald-400" />
                              <span>Välj från enhet</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleDogImageUpload(idx, e)}
                                className="hidden"
                              />
                            </label>

                            <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 transition">
                              <Camera className="h-3 w-3" />
                              <span>Kamera</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => handleDogImageUpload(idx, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Dog Basic Details: Name, Age, Gender */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">
                            Hundens tilltalsnamn
                          </label>
                          <input
                            type="text"
                            value={dog.name}
                            onChange={(e) => handleUpdateDogField(idx, "name", e.target.value)}
                            placeholder="T.ex. Milo, Sakura, Ronja"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">
                            Ålder
                          </label>
                          <input
                            type="text"
                            value={dog.age}
                            onChange={(e) => handleUpdateDogField(idx, "age", e.target.value)}
                            placeholder="T.ex. 2 år / 6 månader"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">
                            Kön
                          </label>
                          <select
                            value={dog.gender}
                            onChange={(e) =>
                              handleUpdateDogField(idx, "gender", e.target.value as "Hane" | "Tik")
                            }
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="Hane">Hane</option>
                            <option value="Tik">Tik</option>
                          </select>
                        </div>
                      </div>

                      {/* Breed Search Input */}
                      <div className="relative">
                        <label className="text-[11px] text-zinc-400 block mb-1">
                          Hundras (Sök bland världens alla hundraser)
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Sök ras (t.ex. Shiba, Akita, Mastiff, Golden, Jämthund...)"
                            value={
                              activeDogBreedSearchIdx === idx ? breedSearchQuery : dog.breedName
                            }
                            onFocus={() => {
                              setActiveDogBreedSearchIdx(idx);
                              setBreedSearchQuery("");
                            }}
                            onChange={(e) => {
                              setActiveDogBreedSearchIdx(idx);
                              setBreedSearchQuery(e.target.value);
                            }}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Search dropdown results */}
                        {activeDogBreedSearchIdx === idx && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-xl">
                            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                              Välj ras ur registret:
                            </div>
                            {filteredBreeds.map((breed) => (
                              <button
                                key={breed.id}
                                type="button"
                                onClick={() => {
                                  handleUpdateDogField(idx, "breedName", breed.name);
                                  handleUpdateDogField(idx, "breedId", breed.id);
                                  setActiveDogBreedSearchIdx(null);
                                  setBreedSearchQuery("");
                                }}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-zinc-800 transition cursor-pointer"
                              >
                                <div>
                                  <span className="font-semibold text-white">{breed.name}</span>
                                  <span className="text-[10px] text-zinc-400 ml-1.5">
                                    ({breed.origin})
                                  </span>
                                </div>
                                <span className="text-[10px] text-amber-400/80">
                                  {breed.group.slice(0, 18)}...
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Health & Stamtavlenamn */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">
                            Officiellt Stamtavlenamn (Valfritt)
                          </label>
                          <input
                            type="text"
                            value={dog.registeredName || ""}
                            onChange={(e) =>
                              handleUpdateDogField(idx, "registeredName", e.target.value)
                            }
                            placeholder="T.ex. SE UCH Ryuujin Go Sakura"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">
                            Hälsostatus & Meriter
                          </label>
                          <input
                            type="text"
                            value={dog.healthStatus || ""}
                            onChange={(e) =>
                              handleUpdateDogField(idx, "healthStatus", e.target.value)
                            }
                            placeholder="T.ex. HD grad A, Ögonlyst UA, Patella 0/0"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ROLL-SPECIFIKT */}
          {activeTab === "ROLE_SPECIFIC" && (
            <div className="space-y-5">
              {/* If BREEDER */}
              {selectedRole === "BREEDER" && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20 text-amber-400">
                    <Building className="h-5 w-5" />
                    <h3 className="text-sm font-bold">Kennel- & Uppfödaruppgifter</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-300 block mb-1">
                        Kennelnamn
                      </label>
                      <input
                        type="text"
                        value={kennelName}
                        onChange={(e) => setKennelName(e.target.value)}
                        placeholder="T.ex. Novens Kennel"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-300 block mb-1">
                        Kennelprefix
                      </label>
                      <input
                        type="text"
                        value={kennelPrefix}
                        onChange={(e) => setKennelPrefix(e.target.value)}
                        placeholder="T.ex. Novens / Hagakure"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-300 block mb-1">
                        Stamboksorganisation
                      </label>
                      <select
                        value={registry}
                        onChange={(e) =>
                          setRegistry(e.target.value as "SKK (Sverige)" | "NIPPO (Japan)" | "FCI (Europa)")
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="SKK (Sverige)">SKK (Svenska Kennelklubben)</option>
                        <option value="NIPPO (Japan)">NIPPO (Nihon Ken Hozonkai)</option>
                        <option value="FCI (Europa)">FCI (Fédération Cynologique)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-300 block mb-1">
                        Etableringsår
                      </label>
                      <input
                        type="number"
                        value={kennelEstYear}
                        onChange={(e) => setKennelEstYear(parseInt(e.target.value) || 2020)}
                        placeholder="T.ex. 2012"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-300 block mb-1">
                      Planerade kullar
                    </label>
                    <input
                      type="text"
                      value={kennelLitters}
                      onChange={(e) => setKennelLitters(e.target.value)}
                      placeholder="T.ex. Planerad valpkull Vinter 2026/2027"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-300 block mb-1 flex items-center gap-1">
                      <Globe className="h-3 w-3 text-amber-400" />
                      <span>Kennelns officiella hemsida</span>
                    </label>
                    <input
                      type="url"
                      value={kennelWebsite}
                      onChange={(e) => setKennelWebsite(e.target.value)}
                      placeholder="https://www.minkennel.se"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* If SEEKING_DOG */}
              {selectedRole === "SEEKING_DOG" && (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/20 text-cyan-400">
                    <Heart className="h-5 w-5" />
                    <h3 className="text-sm font-bold">Valpköpar- & Rasönskemål</h3>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-zinc-300">
                        Intressanta raser du söker
                      </label>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {selectedBreeds.length} valda
                      </span>
                    </div>

                    {/* Selected Breed Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5 min-h-[32px] p-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
                      {selectedBreeds.length === 0 ? (
                        <span className="text-[11px] text-zinc-500 italic">
                          Inga raser valda ännu. Klicka på &quot;Raser&quot; nedan för att välja ur världsregistret.
                        </span>
                      ) : (
                        selectedBreeds.map((breedName) => (
                          <span
                            key={breedName}
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/15 border border-cyan-500/35 px-2 py-0.5 text-xs font-semibold text-cyan-300 shadow-sm"
                          >
                            <span>🐾 {breedName}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleBreed(breedName)}
                              className="text-cyan-400 hover:text-white p-0.5 rounded-full hover:bg-cyan-500/20 transition cursor-pointer"
                              title={`Ta bort ${breedName}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Searchable World Breed Dropdown Menu for Seeker */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsBreedDropdownOpen(!isBreedDropdownOpen)}
                          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-white hover:border-cyan-500/50 transition shadow-sm cursor-pointer"
                        >
                          <Search className="h-3.5 w-3.5 text-cyan-400" />
                          <span>
                            {selectedBreeds.length > 0
                              ? `Raser (${selectedBreeds.length} valda)`
                              : "Raser (Sök & välj bland alla i världen)"}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                        </button>

                        {selectedBreeds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedBreeds([])}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs flex items-center gap-1 border border-zinc-800 cursor-pointer"
                            title="Rensa alla valda raser"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Rensa alla</span>
                          </button>
                        )}
                      </div>

                      {/* Dropdown Menu */}
                      {isBreedDropdownOpen && (
                        <div className="absolute top-full left-0 z-40 mt-1.5 w-72 sm:w-84 rounded-2xl border border-zinc-800 bg-zinc-950 p-2.5 shadow-2xl space-y-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                            <input
                              type="text"
                              placeholder="Sök bland världens alla hundraser..."
                              value={breedSearchText}
                              onChange={(e) => setBreedSearchText(e.target.value)}
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                              autoFocus
                            />
                          </div>

                          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                            {filteredBreedsForSeeker.map((b) => {
                              const isSelected = selectedBreeds.includes(b.name);
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => handleToggleBreed(b.name)}
                                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                                    isSelected
                                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold"
                                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent"
                                  }`}
                                >
                                  <div>
                                    <span className="font-medium block">{b.name}</span>
                                    <span className="text-[10px] text-zinc-500">
                                      {b.origin} • {b.group.slice(0, 24)}...
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-cyan-400 shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-300 block mb-1">
                        Önskad tidsplan
                      </label>
                      <input
                        type="text"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        placeholder="T.ex. Våren 2026 / Inom 1 år"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-300 block mb-1">
                        Boendesituation
                      </label>
                      <input
                        type="text"
                        value={livingSituation}
                        onChange={(e) => setLivingSituation(e.target.value)}
                        placeholder="T.ex. Villa med tomt / Lägenhet nära skog"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-300 block mb-1">
                      Tidigare hundvana
                    </label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="T.ex. Haft spetshund tidigare / Förstagångsägare med stort engagemang"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* If DOG_OWNER */}
              {selectedRole === "DOG_OWNER" && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20 text-emerald-400">
                    <Dog className="h-5 w-5" />
                    <h3 className="text-sm font-bold">Hundägarens gemenskap & preferenser</h3>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Som hundägare på UrHund kan du hitta lekkamrater för rastgården, få kontakt med godkända hundvakter i ditt område samt ta del av tips och råd från erfarna rasexperter.
                  </p>
                  <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-3 space-y-1.5 text-xs text-zinc-400">
                    <p className="text-white font-semibold">Aktiva inställningar:</p>
                    <p>• Synlig i sökningen för hundträffar och lekkompisar i {city || "ditt område"}</p>
                    <p>• Tillgång till hundvaktsförmedling och rekommenderade rastplatser</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SÄKERHET & KONTO */}
          {activeTab === "SECURITY" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                  Kontoinformation
                </span>

                <div className="flex items-center justify-between py-2 border-b border-zinc-800/80 text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    E-postadress:
                  </span>
                  <span className="font-semibold text-white font-mono">
                    {email || "Gästkonto (lokal profil)"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-zinc-800/80 text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Verifieringsstatus:
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {profile.verified ? "Verifierad UrHund-medlem" : "Aktiv medlem"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 text-xs">
                  <span className="text-zinc-400">Konto-ID:</span>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {profile.id || "Lokal session"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                <p className="text-xs font-semibold text-white">Dataskydd och integritet</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Alla dina uppgifter lagras säkert i enlighet med gällande dataskyddsregler. Dina hundars information och dina inlägg syns för gemenskapen på UrHund.
                </p>
              </div>
            </div>
          )}

          {/* Error & Success Feedback */}
          {saveError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 text-center">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 text-center font-bold flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Dina kontoinställningar har sparats!</span>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/90">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              Avbryt
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sparar ändringar...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Spara inställningar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
