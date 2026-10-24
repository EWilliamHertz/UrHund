"use client";

import React, { useState } from "react";
import {
  Globe2,
  Search,
  X,
  Dog,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  ZoomIn,
} from "lucide-react";
import { Kennel } from "@/data/breeds";
import { ALL_WORLD_BREEDS } from "@/data/allWorldBreeds";

interface KennelsViewProps {
  kennels: Kennel[];
  onSelectKennel: (kennel: Kennel) => void;
  isMobileMode?: boolean;
}

export function KennelsView({
  kennels,
  onSelectKennel,
  isMobileMode = false,
}: KennelsViewProps) {
  const [kennelSearchQuery, setKennelSearchQuery] = useState("");
  const [kennelFilter, setKennelFilter] = useState<"ALL" | "SWEDEN" | "NORDIC" | "JAPAN">("ALL");
  const [kennelBreedFilter, setKennelBreedFilter] = useState<string>("ALL");
  const [worldBreedSearchQuery, setWorldBreedSearchQuery] = useState("");
  const [isWorldBreedDropdownOpen, setIsWorldBreedDropdownOpen] = useState(false);
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<{ url: string; title: string } | null>(null);

  const filteredWorldBreeds = worldBreedSearchQuery.trim()
    ? ALL_WORLD_BREEDS.filter(
        (b) =>
          b.name.toLowerCase().includes(worldBreedSearchQuery.toLowerCase()) ||
          b.nameEn.toLowerCase().includes(worldBreedSearchQuery.toLowerCase()) ||
          b.origin.toLowerCase().includes(worldBreedSearchQuery.toLowerCase())
      )
    : ALL_WORLD_BREEDS;

  const filteredKennels = kennels.filter((kennel) => {
    if (kennelFilter === "SWEDEN" && kennel.country !== "Sverige") return false;
    if (kennelFilter === "NORDIC" && kennel.country === "Japan") return false;
    if (kennelFilter === "JAPAN" && kennel.country !== "Japan") return false;

    if (kennelBreedFilter !== "ALL") {
      if (!kennel.breedIds.includes(kennelBreedFilter)) return false;
    }

    if (kennelSearchQuery.trim()) {
      const q = kennelSearchQuery.toLowerCase();
      const matchesName = kennel.name.toLowerCase().includes(q);
      const matchesCity = kennel.city.toLowerCase().includes(q);
      const matchesCountry = kennel.country.toLowerCase().includes(q);
      const matchesDesc = (kennel.description || "").toLowerCase().includes(q);
      const matchesBreed = kennel.breedIds.some((bid) => {
        const found = ALL_WORLD_BREEDS.find((b) => b.id === bid);
        return (
          bid.toLowerCase().includes(q) ||
          (found && found.name.toLowerCase().includes(q))
        );
      });
      if (!matchesName && !matchesCity && !matchesCountry && !matchesDesc && !matchesBreed) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Photo Preview Modal if user clicks on a dog photo */}
      {selectedPhotoForPreview && (
        <div
          onClick={() => setSelectedPhotoForPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedPhotoForPreview(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-amber-400 text-sm font-semibold"
            >
              ✕ Stäng
            </button>
            <img
              src={selectedPhotoForPreview.url}
              alt={selectedPhotoForPreview.title}
              onError={(e) => {
                e.currentTarget.src = "https://images.dog.ceo/breeds/shiba/shiba-16.jpg";
              }}
              className="rounded-2xl max-h-[80vh] w-auto object-contain border border-zinc-800 shadow-2xl"
            />
            <p className="mt-3 text-sm text-zinc-300 font-semibold">{selectedPhotoForPreview.title}</p>
          </div>
        </div>
      )}

      {/* Directory Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Globe2 className="h-4 w-4" />
            <span>Svenska & Internationella Kennelregistret</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Verifierade Kennlar (SKK / NIPPO / FCI)
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Auktoriserade uppfödare med dokumenterade hälsotester, autentiska hundbilder och officiella avelsplaner.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
          {/* Search Bar & Breed Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Kennel Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Sök kennel, ort, län..."
                value={kennelSearchQuery}
                onChange={(e) => setKennelSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition shadow-sm"
              />
              {kennelSearchQuery && (
                <button
                  type="button"
                  onClick={() => setKennelSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Searchable World Breed Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWorldBreedDropdownOpen(!isWorldBreedDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-white hover:border-amber-500/50 transition shadow-sm w-full sm:w-auto justify-between"
              >
                <Dog className="h-3.5 w-3.5 text-amber-400" />
                <span className="truncate max-w-[160px]">
                  {kennelBreedFilter === "ALL"
                    ? "Alla Hundraser"
                    : `Ras: ${ALL_WORLD_BREEDS.find((b) => b.id === kennelBreedFilter)?.name || kennelBreedFilter}`}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-1" />
              </button>

              {isWorldBreedDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-80 rounded-2xl border border-zinc-800 bg-zinc-950/98 backdrop-blur-xl p-3 shadow-2xl z-50 overflow-hidden flex flex-col animate-fade-in">
                  <div className="relative mb-2 shrink-0">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Sök ras (t.ex. Shiba, Samojed)..."
                      value={worldBreedSearchQuery}
                      onChange={(e) => setWorldBreedSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      autoFocus
                    />
                  </div>

                  <div className="overflow-y-auto space-y-1 flex-1 pr-1 scrollbar-thin">
                    <button
                      type="button"
                      onClick={() => {
                        setKennelBreedFilter("ALL");
                        setIsWorldBreedDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        kennelBreedFilter === "ALL"
                          ? "bg-amber-500 text-zinc-950"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      Alla Raser i Världen ({ALL_WORLD_BREEDS.length} st)
                    </button>

                    {filteredWorldBreeds.map((breed) => (
                      <button
                        key={breed.id}
                        type="button"
                        onClick={() => {
                          setKennelBreedFilter(breed.id);
                          setIsWorldBreedDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition flex items-center justify-between ${
                          kennelBreedFilter === breed.id
                            ? "bg-amber-500 text-zinc-950 font-bold"
                            : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{breed.name}</span>
                        <span className="text-[10px] text-zinc-500 ml-2 shrink-0">{breed.origin}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Country / Registry Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
            <button
              onClick={() => setKennelFilter("ALL")}
              className={`rounded-xl px-3.5 py-1.5 font-semibold transition whitespace-nowrap ${
                kennelFilter === "ALL"
                  ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              Alla kennlar ({kennels.length})
            </button>
            <button
              onClick={() => setKennelFilter("SWEDEN")}
              className={`rounded-xl px-3.5 py-1.5 font-semibold transition whitespace-nowrap ${
                kennelFilter === "SWEDEN"
                  ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              Sverige (SKK)
            </button>
            <button
              onClick={() => setKennelFilter("NORDIC")}
              className={`rounded-xl px-3.5 py-1.5 font-semibold transition whitespace-nowrap ${
                kennelFilter === "NORDIC"
                  ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              Norden & FCI
            </button>
            <button
              onClick={() => setKennelFilter("JAPAN")}
              className={`rounded-xl px-3.5 py-1.5 font-semibold transition whitespace-nowrap ${
                kennelFilter === "JAPAN"
                  ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              Japan & Export
            </button>
          </div>
        </div>
      </div>

      {/* Kennel Cards Grid */}
      <div
        className={`grid grid-cols-1 ${
          isMobileMode ? "" : "md:grid-cols-2 xl:grid-cols-3"
        } gap-6 sm:gap-8`}
      >
        {filteredKennels.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto">
              <Globe2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Inga kennlar matchade filtret</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Välj en annan hundras eller landsfilter ovan, eller rensa sökningen.
            </p>
          </div>
        ) : (
          filteredKennels.map((kennel) => {
            const kennelBreedNames = kennel.breedIds.map((bid) => {
              const found = ALL_WORLD_BREEDS.find((b) => b.id === bid);
              return found ? found.name : bid;
            });

            const coverPhoto = kennel.image || (kennel.photos && kennel.photos[0]) || null;

            return (
              <div
                key={kennel.id}
                onClick={() => onSelectKennel(kennel)}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/50 hover:border-amber-500/50 hover:bg-zinc-900/80 transition-all flex flex-col justify-between cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-black/70 overflow-hidden"
              >
                <div>
                  {/* Real Dog Photo Banner */}
                  {coverPhoto ? (
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-zinc-950">
                      <img
                        src={coverPhoto}
                        alt={`Hundar hos ${kennel.name}`}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.dog.ceo/breeds/shiba/shiba-16.jpg";
                        }}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                      {/* Top Badges over image */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="rounded-full bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 px-2.5 py-1 text-[11px] font-semibold text-amber-300 flex items-center gap-1 shadow">
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                          {kennel.registry}
                        </span>

                        {kennel.planningLitter && kennel.nextLitterEstimate ? (
                          <span className="rounded-full bg-emerald-500/95 text-zinc-950 px-2.5 py-1 text-[11px] font-bold shadow backdrop-blur-md">
                            Kull: {kennel.nextLitterEstimate}
                          </span>
                        ) : null}
                      </div>

                      {/* Breed tag overlay at bottom */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {kennelBreedNames.slice(0, 2).map((name, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-white"
                            >
                              <Dog className="h-3 w-3 text-amber-400" />
                              {name}
                            </span>
                          ))}
                          {kennelBreedNames.length > 2 && (
                            <span className="inline-flex items-center rounded-lg bg-black/75 backdrop-blur-md border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                              +{kennelBreedNames.length - 2}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhotoForPreview({
                              url: coverPhoto,
                              title: `${kennel.name} — ${kennelBreedNames.join(", ")}`,
                            });
                          }}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/10 transition"
                          title="Förstora foto"
                        >
                          <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                          <ShieldCheck className="h-4 w-4" />
                          {kennel.registry}
                        </span>
                        {kennel.planningLitter && (
                          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            Kull: {kennel.nextLitterEstimate}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Body Details */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition tracking-tight">
                        {kennel.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3.5 text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          {kennel.city}, {kennel.country}
                        </span>
                        {kennel.verifiedHealthTests && (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Hälsotestade avelsdjur
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Informative Kennel Description */}
                    {kennel.description && (
                      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-4 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-36 overflow-y-auto scrollbar-thin">
                        <p>{kennel.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Clear separation so button never overlaps info */}
                <div className="p-5 sm:p-6 pt-0">
                  <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      {kennel.website && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-amber-400/90 font-medium text-[11px]">
                          <Globe2 className="h-3 w-3" />
                          Webbplats
                        </span>
                      )}
                      {kennel.phone && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-emerald-400/90 font-medium text-[11px]">
                          <Phone className="h-3 w-3" />
                          Telefon
                        </span>
                      )}
                      {kennel.litters && kennel.litters.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-cyan-300 font-medium text-[11px]">
                          🐾 {kennel.litters.length} kull{kennel.litters.length > 1 ? "ar" : ""}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectKennel(kennel);
                      }}
                      className="inline-flex items-center justify-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-4 py-2.5 rounded-xl border border-amber-500/35 transition shadow-sm shrink-0 w-full sm:w-auto cursor-pointer"
                    >
                      <span>Se kennelprofil & kullar</span>
                      <span className="text-amber-400">→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
