"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Calendar,
  Dog,
  MapPin,
  Clock,
  Camera,
  Search,
  Upload,
  Settings,
} from "lucide-react";
import { UserRole, UserProfile, DogItem, formatMembershipDuration } from "@/data/mockSocial";
import { Kennel } from "@/data/breeds";
import { ALL_WORLD_BREEDS } from "@/data/allWorldBreeds";

interface RightSidebarProps {
  currentRole: UserRole;
  profile: UserProfile;
  kennels: Kennel[];
  onGenerateAIPost: () => void;
  onSelectTab: (tab: "FEED" | "MATES" | "SITTING" | "BREEDS" | "KENNELS") => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onOpenAuthModal?: () => void;
  onOpenSettings?: () => void;
  onSelectKennel?: (kennel: Kennel) => void;
}

export function RightSidebar({
  currentRole,
  profile,
  kennels,
  onGenerateAIPost: _onGenerateAIPost,
  onSelectTab,
  onUpdateProfile,
  onOpenAuthModal,
  onOpenSettings,
  onSelectKennel,
}: RightSidebarProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const allDogs: DogItem[] = (profile.dogs && profile.dogs.length > 0)
    ? profile.dogs
    : (profile.dog ? [profile.dog] : []);

  // Handle uploading or changing a dog's picture directly from sidebar
  const handleDogImageChange = async (dogIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const newImageUrl = event.target.result as string;
        const updatedDogs = [...allDogs];
        if (updatedDogs[dogIndex]) {
          updatedDogs[dogIndex] = {
            ...updatedDogs[dogIndex],
            image: newImageUrl,
          };
        }

        const updatedProfile: UserProfile = {
          ...profile,
          dog: updatedDogs[0],
          dogs: updatedDogs,
        };

        if (onUpdateProfile) {
          onUpdateProfile(updatedProfile);
        }

        try {
          localStorage.setItem("urhund_active_user", JSON.stringify(updatedProfile));
          if (profile.id) {
            await fetch("/api/auth/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedProfile),
            });
          }
        } catch (err) {
          console.error("Failed to save updated dog image:", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="space-y-6">
      {/* Active Profile Snapshot Card */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
            {currentRole === "BREEDER"
              ? "Din Kennelprofil"
              : currentRole === "SEEKING_DOG"
              ? "Valpköparprofil"
              : "Din Hundprofil"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
              currentRole === "BREEDER"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : currentRole === "SEEKING_DOG"
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            Aktiv i Flödet
          </span>
        </div>

        {/* User Account Info & Membership Duration */}
        <div className="mt-3.5 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Medlem:</span>
            <span className="text-xs font-bold text-white">{profile.name}</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs">
            <span className="text-zinc-400">Roll i gemenskapen:</span>
            <span
              className={`font-semibold text-[11px] ${
                currentRole === "BREEDER"
                  ? "text-amber-300"
                  : currentRole === "SEEKING_DOG"
                  ? "text-cyan-300"
                  : "text-emerald-300"
              }`}
            >
              {currentRole === "BREEDER"
                ? "🏛️ Kennel / Uppfödare"
                : currentRole === "SEEKING_DOG"
                ? "🐾 Vill skaffa hund"
                : "🐕 Hundägare"}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 text-zinc-500">
              <MapPin className="h-3 w-3" />
              {profile.city || profile.location || "Sverige"}
            </span>
            <span className="flex items-center gap-1 text-amber-400/90 font-medium">
              <Clock className="h-3 w-3" />
              {formatMembershipDuration(profile.createdAt)}
            </span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/80 hover:border-zinc-700 py-1.5 px-3 text-[11px] font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-amber-400" />
              <span>Redigera profil & inställningar</span>
            </button>
          )}
        </div>

        {/* Content for DOG_OWNER with support for multiple dogs & image upload */}
        {currentRole === "DOG_OWNER" && (
          <div className="mt-4 space-y-4">
            {allDogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/40 p-4 text-center">
                <Dog className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">Ingen hund tillagd ännu</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Öppna kontoinställningar för att lägga till dina hundar med ras och foto.
                </p>
                {onOpenSettings ? (
                  <button
                    onClick={onOpenSettings}
                    className="mt-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
                  >
                    + Lägg till hund i inställningar
                  </button>
                ) : onOpenAuthModal ? (
                  <button
                    onClick={onOpenAuthModal}
                    className="mt-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
                  >
                    + Lägg till hund
                  </button>
                ) : null}
              </div>
            ) : (
              allDogs.map((dog, idx) => {
                const imgKey = `${dog.id || idx}`;
                const hasError = imageErrors[imgKey];

                return (
                  <div
                    key={dog.id || idx}
                    className="rounded-2xl bg-zinc-950/70 p-3.5 border border-zinc-800/90 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Dog Picture with Upload & Fallback */}
                      <div className="relative group shrink-0">
                        {dog.image && !hasError ? (
                          <img
                            src={dog.image}
                            alt={dog.name}
                            onError={() => setImageErrors((prev) => ({ ...prev, [imgKey]: true }))}
                            className="h-14 w-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950 to-zinc-900 text-emerald-400 text-lg font-black shadow-md">
                            {dog.name ? dog.name.slice(0, 2).toUpperCase() : "🐕"}
                          </div>
                        )}

                        {/* Image change trigger */}
                        <label
                          title="Ändra bild för denna hund"
                          className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-md hover:bg-emerald-400 transition"
                        >
                          <Camera className="h-3 w-3" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDogImageChange(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Dog Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white truncate">
                            {dog.name}
                          </h4>
                          <span className="text-[10px] font-semibold rounded bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 border border-emerald-500/20">
                            {dog.gender || "Hund"}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400 font-medium mt-0.5 truncate">
                          {dog.breedName || "Urhund"} • {dog.age || "2 år"}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{dog.healthStatus || "Hälsokontrollerad"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="w-full cursor-pointer flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 py-1.5 text-[11px] font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition">
                        <Upload className="h-3 w-3 text-emerald-400" />
                        <span>{dog.image ? "Ändra hundens bild" : "Välj bild på hunden"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDogImageChange(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                );
              })
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
              <button
                onClick={() => onSelectTab("MATES")}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300 hover:bg-emerald-500/20 text-center transition"
              >
                🎾 Hitta kompis
              </button>
              <button
                onClick={() => onSelectTab("SITTING")}
                className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-300 hover:bg-indigo-500/20 text-center transition"
              >
                🏠 Hitta hundvakt
              </button>
            </div>
          </div>
        )}

        {/* Content for SEEKING_DOG */}
        {currentRole === "SEEKING_DOG" && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-zinc-950/70 p-3.5 border border-cyan-500/30 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                  <Search className="h-3.5 w-3.5" />
                  Dina Valp- & Rasönskemål
                </span>
                <span className="text-zinc-500 font-mono text-[10px]">
                  {profile.prospectiveInfo?.desiredDogs?.length || 1} st
                </span>
              </div>

              {/* Multiple Desired Dogs List */}
              {profile.prospectiveInfo?.desiredDogs && profile.prospectiveInfo.desiredDogs.length > 0 ? (
                <div className="space-y-2">
                  {profile.prospectiveInfo.desiredDogs.map((dog, idx) => (
                    <div
                      key={dog.id || idx}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          🐾 {dog.breedName}
                        </span>
                        {dog.years && (
                          <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                            {dog.years}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-cyan-300 font-medium">
                        {dog.timeframe || `Söker denna hundrasen vid; ${dog.years}`}
                      </p>
                      {dog.preparationStatus && (
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1 pt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
                          <span>{dog.preparationStatus}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-white font-semibold">
                    Söker: {profile.prospectiveInfo?.interestedBreeds?.join(", ") || "Asiatisk spets / Urhund"}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Tidsplan: {profile.prospectiveInfo?.timeframe || "Planerar valpköp"}
                  </p>
                </div>
              )}

              <div className="border-t border-zinc-800/80 pt-2 space-y-1 text-[11px] text-zinc-400">
                <p>
                  Boende: <span className="text-zinc-200">{profile.prospectiveInfo?.livingSituation || "Villa med tomt"}</span>
                </p>
                <p>
                  Hundvana: <span className="text-zinc-200">{profile.prospectiveInfo?.experience || "Haft hund tidigare"}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectTab("KENNELS")}
              className="w-full rounded-xl bg-cyan-500/15 border border-cyan-500/30 p-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25 transition text-center"
            >
              Hitta godkända kennlar & valpar →
            </button>
          </div>
        )}

        {/* Content for BREEDER */}
        {currentRole === "BREEDER" && profile.kennel && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-500 bg-amber-500/10 text-amber-400 text-xl font-bold">
                犬
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {profile.kennel.name}
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Etablerad {profile.kennel.establishedYear} • {profile.registry || "SKK"}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {profile.city || profile.location}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-950/70 p-3 border border-zinc-800/80 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                Planerad kull:
              </span>
              <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {profile.kennel.plannedLitters || "Planerad avel"}
              </p>
            </div>

            <button
              onClick={() => onSelectTab("KENNELS")}
              className="w-full rounded-xl bg-amber-500/15 border border-amber-500/30 p-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition text-center"
            >
              Hantera Kennelprofil i Registret
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Litters Quick List */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl shadow-black/40 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Planerade Valpkullar 2026/2027
          </h4>
          <button
            onClick={() => onSelectTab("KENNELS")}
            className="text-[11px] text-zinc-400 hover:text-white"
          >
            Se alla
          </button>
        </div>

        <div className="space-y-3">
          {(() => {
            const upcomingLitters = kennels
              .filter((k) => k.planningLitter && k.nextLitterEstimate)
              .reduce<Kennel[]>((acc, k) => {
                if (
                  !acc.some(
                    (item) =>
                      item.name.toLowerCase() === k.name.toLowerCase() ||
                      item.breedIds[0] === k.breedIds[0]
                  )
                ) {
                  acc.push(k);
                }
                return acc;
              }, [])
              .slice(0, 4);

            if (upcomingLitters.length === 0) {
              return (
                <p className="text-xs text-zinc-500 py-2 text-center">
                  Inga planerade valpkullar registrerade just nu.
                </p>
              );
            }

            return upcomingLitters.map((kennel) => {
              const breed = ALL_WORLD_BREEDS.find((b) => b.id === kennel.breedIds[0]);
              const breedName = breed ? breed.name : (kennel.breedIds[0] || "Hundras");

              return (
                <div
                  key={kennel.id}
                  onClick={() => onSelectKennel && onSelectKennel(kennel)}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3 hover:border-amber-500/50 hover:bg-zinc-900/80 transition cursor-pointer group shadow-sm"
                  title={`Visa ${kennel.name} och kullplanering`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                      <Dog className="h-3.5 w-3.5" />
                      <span>{breedName}</span>
                    </span>
                    <span className="text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-300 px-2 py-0.5 border border-amber-500/20">
                      {kennel.nextLitterEstimate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                      {kennel.name}
                    </span>
                    <span className="text-xs text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition">
                      →
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <MapPin className="h-3 w-3 text-zinc-500" />
                      {kennel.city}
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">{kennel.registry}</span>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Community Guidelines Box */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl shadow-black/40 space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trygghet & Verifiering
          </span>
          <span className="text-[10px] text-zinc-500">SKK & FCI</span>
        </div>

        <p className="text-zinc-300 leading-relaxed">
          Alla kennlar och avelsplaner som publiceras på Urhund.se verifieras mot officiella register (SKK Hunddata / Avelsdata) för dokumenterad hälsostatus och mentalbeskrivning.
        </p>

        <div className="rounded-xl bg-zinc-950/70 p-2.5 border border-zinc-800/80 text-[11px] text-zinc-400">
          ✓ HD/ED-röntgen dokumenterad<br />
          ✓ BPH / Mentalbeskrivning genomförd<br />
          ✓ Rymningssäker inhägnad för hundvakt
        </div>
      </div>
    </aside>
  );
}
