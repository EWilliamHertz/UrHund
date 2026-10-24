"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Users,
  Home,
  BookOpen,
  Award,
  Sparkles,
  MapPin,
  Heart,
  ShieldCheck,
  X,
  Repeat,
  Compass,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  Settings,
} from "lucide-react";
import { UserRole, UserProfile, DogMateProfile, DogSitterProfile } from "@/data/mockSocial";
import { Breed, Kennel } from "@/data/breeds";

interface FacebookNavbarProps {
  currentRole: UserRole;
  profile: UserProfile;
  breeds: Breed[];
  kennels: Kennel[];
  dogMates: DogMateProfile[];
  dogSitters: DogSitterProfile[];
  activeTab: "FEED" | "MATES" | "SITTING" | "BREEDS" | "KENNELS";
  onSelectTab: (tab: "FEED" | "MATES" | "SITTING" | "BREEDS" | "KENNELS") => void;
  onSwitchRole?: (newRole: UserRole) => void;
  onOpenRoleModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenSettings?: () => void;
  onSelectSearchTarget?: (type: string, id: string) => void;
  onLogout?: () => void;
  isMobileMode?: boolean;
}

export function FacebookNavbar({
  currentRole,
  profile,
  breeds,
  kennels,
  dogMates,
  dogSitters,
  activeTab,
  onSelectTab,
  onOpenRoleModal,
  onOpenAuthModal,
  onOpenSettings,
  onLogout,
  isMobileMode = false,
}: FacebookNavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"ALL" | "KENNELS" | "MATES" | "SITTING" | "BREEDS">("ALL");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filter items based on searchQuery & searchFilter
  const query = searchQuery.toLowerCase().trim();

  const matchingKennels = kennels.filter(
    (k) =>
      (searchFilter === "ALL" || searchFilter === "KENNELS") &&
      (!query || k.name.toLowerCase().includes(query) || k.city.toLowerCase().includes(query) || k.country.toLowerCase().includes(query))
  );

  const matchingDogMates = dogMates.filter(
    (m) =>
      (searchFilter === "ALL" || searchFilter === "MATES") &&
      (!query ||
        m.dogName.toLowerCase().includes(query) ||
        m.breedName.toLowerCase().includes(query) ||
        m.city.toLowerCase().includes(query) ||
        m.area.toLowerCase().includes(query))
  );

  const matchingDogSitters = dogSitters.filter(
    (s) =>
      (searchFilter === "ALL" || searchFilter === "SITTING") &&
      (!query ||
        s.name.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query) ||
        s.area.toLowerCase().includes(query) ||
        s.homeType.toLowerCase().includes(query))
  );

  const matchingBreeds = breeds.filter(
    (b) =>
      (searchFilter === "ALL" || searchFilter === "BREEDS") &&
      (!query || b.name.toLowerCase().includes(query) || b.nativeName.toLowerCase().includes(query) || b.origin.toLowerCase().includes(query))
  );

  const totalResults =
    (searchFilter === "ALL" || searchFilter === "KENNELS" ? matchingKennels.length : 0) +
    (searchFilter === "ALL" || searchFilter === "MATES" ? matchingDogMates.length : 0) +
    (searchFilter === "ALL" || searchFilter === "SITTING" ? matchingDogSitters.length : 0) +
    (searchFilter === "ALL" || searchFilter === "BREEDS" ? matchingBreeds.length : 0);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl">
      {/* Top Tier: Logo + Search Bar + User Profile */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2.5 sm:px-4 py-2 sm:py-2.5 gap-2 sm:gap-4">
        {/* Left: Brand Logo */}
        <button
          onClick={() => onSelectTab("FEED")}
          className="flex items-center gap-2 shrink-0 text-left group"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 font-bold text-base sm:text-lg group-hover:scale-105 transition-transform">
            犬
          </div>
          <div>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-0.5">
              UrHund<span className="text-amber-400">.se</span>
            </span>
            <p className={`${isMobileMode ? "hidden" : "hidden sm:block"} text-[10px] text-zinc-400 leading-none`}>
              Urhundar & Kennelregister
            </p>
          </div>
        </button>

        {/* Center: Search Box above the links */}
        <div ref={searchRef} className="relative flex-1 max-w-xl mx-1 sm:mx-6">
            <div className="flex items-center rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 focus-within:border-amber-500/70 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400 shrink-0 mr-1.5 sm:mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Sök kennlar, kompisar..."
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[75vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl shadow-black/80 z-50">
                {/* Filter Chips inside Search */}
                <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-zinc-800 overflow-x-auto text-[11px]">
                  <button
                    onClick={() => setSearchFilter("ALL")}
                    className={`rounded-lg px-2.5 py-1 font-medium transition ${
                      searchFilter === "ALL"
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white"
                    }`}
                  >
                    Allt
                  </button>
                  <button
                    onClick={() => setSearchFilter("MATES")}
                    className={`rounded-lg px-2.5 py-1 font-medium transition ${
                      searchFilter === "MATES"
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white"
                    }`}
                  >
                    🎾 Hundkompisar
                  </button>
                  <button
                    onClick={() => setSearchFilter("SITTING")}
                    className={`rounded-lg px-2.5 py-1 font-medium transition ${
                      searchFilter === "SITTING"
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white"
                    }`}
                  >
                    🏠 Hundvakt
                  </button>
                  <button
                    onClick={() => setSearchFilter("KENNELS")}
                    className={`rounded-lg px-2.5 py-1 font-medium transition ${
                      searchFilter === "KENNELS"
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white"
                    }`}
                  >
                    🏛️ Kennlar
                  </button>
                  <button
                    onClick={() => setSearchFilter("BREEDS")}
                    className={`rounded-lg px-2.5 py-1 font-medium transition ${
                      searchFilter === "BREEDS"
                        ? "bg-amber-500 text-zinc-950"
                        : "bg-zinc-800/80 text-zinc-300 hover:text-white"
                    }`}
                  >
                    📖 Raser
                  </button>
                </div>

                {totalResults === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-400">
                    Inga träffar för &ldquo;{searchQuery}&rdquo;. Prova att söka på en stad, ras eller kennelnamn!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Dog Mates Category */}
                    {(searchFilter === "ALL" || searchFilter === "MATES") && matchingDogMates.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 px-2 mb-1.5 flex items-center justify-between">
                          <span>🎾 Hundkompisar i närområdet</span>
                          <span className="text-zinc-500">{matchingDogMates.length} st</span>
                        </div>
                        <div className="space-y-1">
                          {matchingDogMates.slice(0, 3).map((mate) => (
                            <button
                              key={mate.id}
                              onClick={() => {
                                onSelectTab("MATES");
                                setIsSearchOpen(false);
                              }}
                              className="w-full flex items-center gap-3 rounded-xl p-2 text-left hover:bg-zinc-800/70 transition"
                            >
                              <img
                                src={mate.image}
                                alt={mate.dogName}
                                className="h-9 w-9 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-white truncate">
                                  {mate.dogName} ({mate.breedName}, {mate.age})
                                </div>
                                <div className="text-[11px] text-zinc-400 flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 text-emerald-400" />
                                  {mate.area}, {mate.city} • {mate.distanceKm} km bort
                                </div>
                              </div>
                              <span className="text-[10px] rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20">
                                Lekträff
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dog Sitting Category */}
                    {(searchFilter === "ALL" || searchFilter === "SITTING") && matchingDogSitters.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 px-2 mb-1.5 flex items-center justify-between">
                          <span>🏠 Hundvakt & Passning</span>
                          <span className="text-zinc-500">{matchingDogSitters.length} st</span>
                        </div>
                        <div className="space-y-1">
                          {matchingDogSitters.slice(0, 3).map((sitter) => (
                            <button
                              key={sitter.id}
                              onClick={() => {
                                onSelectTab("SITTING");
                                setIsSearchOpen(false);
                              }}
                              className="w-full flex items-center gap-3 rounded-xl p-2 text-left hover:bg-zinc-800/70 transition"
                            >
                              <img
                                src={sitter.avatar}
                                alt={sitter.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                  {sitter.name}
                                  <span className="text-amber-400 font-normal">★ {sitter.rating}</span>
                                </div>
                                <div className="text-[11px] text-zinc-400 flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 text-indigo-400" />
                                  {sitter.area}, {sitter.city} • {sitter.ratePerDaySEK} kr/dygn
                                </div>
                              </div>
                              <span className="text-[10px] rounded bg-indigo-500/10 text-indigo-400 px-2 py-0.5 border border-indigo-500/20">
                                Boka vakt
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kennels Category */}
                    {(searchFilter === "ALL" || searchFilter === "KENNELS") && matchingKennels.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 px-2 mb-1.5 flex items-center justify-between">
                          <span>🏛️ Verifierade Kennlar</span>
                          <span className="text-zinc-500">{matchingKennels.length} st</span>
                        </div>
                        <div className="space-y-1">
                          {matchingKennels.slice(0, 3).map((kennel) => (
                            <button
                              key={kennel.id}
                              onClick={() => {
                                onSelectTab("KENNELS");
                                setIsSearchOpen(false);
                              }}
                              className="w-full flex items-center justify-between rounded-xl p-2 text-left hover:bg-zinc-800/70 transition"
                            >
                              <div>
                                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  {kennel.name}
                                  <ShieldCheck className="h-3 w-3 text-amber-400" />
                                </div>
                                <div className="text-[11px] text-zinc-400">
                                  {kennel.city}, {kennel.country} • {kennel.registry}
                                </div>
                              </div>
                              {kennel.planningLitter && (
                                <span className="text-[10px] rounded bg-amber-500/10 text-amber-400 px-2 py-0.5 border border-amber-500/20">
                                  Kull: {kennel.nextLitterEstimate}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Right: User Profile & Clickable Avatar Dropdown */}
        <div className="relative shrink-0" ref={avatarMenuRef}>
          <button
            onClick={() => setIsAvatarMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-2xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition group focus:outline-none cursor-pointer"
            title="Konto, profil & inställningar"
          >
            <div className={`${isMobileMode ? "hidden" : "hidden sm:flex"} flex-col items-end text-right`}>
              <span className="text-xs font-bold text-white leading-tight group-hover:text-amber-300 transition">
                {profile.name}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  currentRole === "BREEDER"
                    ? "text-amber-400"
                    : currentRole === "SEEKING_DOG"
                    ? "text-cyan-400"
                    : "text-emerald-400"
                }`}
              >
                {currentRole === "BREEDER"
                  ? "🏛️ Kennel / Uppfödare"
                  : currentRole === "SEEKING_DOG"
                  ? "🐾 Vill skaffa hund"
                  : "🐕 Hundägare"}
              </span>
            </div>

            {/* Active Profile Avatar */}
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className={`h-9 w-9 rounded-full object-cover border-2 shadow-sm ${
                    currentRole === "BREEDER"
                      ? "border-amber-500"
                      : currentRole === "SEEKING_DOG"
                      ? "border-cyan-500"
                      : "border-emerald-500"
                  }`}
                />
              ) : (
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${
                    currentRole === "BREEDER"
                      ? "border-amber-500 bg-amber-500/20 text-amber-300"
                      : currentRole === "SEEKING_DOG"
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                      : "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {profile.name ? profile.name.slice(0, 2).toUpperCase() : "🐕"}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 ${
                  currentRole === "BREEDER"
                    ? "bg-amber-400"
                    : currentRole === "SEEKING_DOG"
                    ? "bg-cyan-400"
                    : "bg-emerald-400"
                }`}
              />
            </div>

            <ChevronDown
              className={`h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition duration-200 ${
                isAvatarMenuOpen ? "rotate-180 text-amber-400" : ""
              }`}
            />
          </button>

          {/* Facebook-style Account & Settings Dropdown Menu */}
          {isAvatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-zinc-900/98 backdrop-blur-xl p-3 shadow-2xl z-50 animate-fade-in text-zinc-100">
              {/* Profile Card Header */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 mb-2 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800 flex items-center justify-center font-bold text-amber-400">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{profile.name ? profile.name.slice(0, 2).toUpperCase() : "🐕"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{profile.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {profile.email || "Gästkonto (ej inloggad)"}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        currentRole === "BREEDER"
                          ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                          : currentRole === "SEEKING_DOG"
                          ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
                          : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      {currentRole === "BREEDER"
                        ? "🏛️ Kennel / Uppfödare"
                        : currentRole === "SEEKING_DOG"
                        ? "🐾 Vill skaffa hund"
                        : "🐕 Hundägare"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="space-y-1">
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition text-left cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-amber-400" />
                    <span>Kontoinställningar</span>
                  </button>
                )}

                {onOpenRoleModal && (
                  <button
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      onOpenRoleModal();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800 transition text-left cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Byt roll i hundvärlden</span>
                  </button>
                )}

                {!profile.email && onOpenAuthModal && (
                  <button
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition text-left cursor-pointer"
                  >
                    <User className="h-4 w-4 text-zinc-400" />
                    <span>Logga in / Skapa nytt konto</span>
                  </button>
                )}

                <div className="my-1.5 border-t border-zinc-800/80" />

                {profile.email && onLogout ? (
                  <button
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    <span>Logga ut från kontot</span>
                  </button>
                ) : (
                  onOpenAuthModal && (
                    <button
                      onClick={() => {
                        setIsAvatarMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition text-left cursor-pointer"
                    >
                      <LogIn className="h-4 w-4 text-amber-400" />
                      <span>Logga in</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP BOTTOM TIER: Navigation Links Bar sitting directly underneath the Search Bar */}
      <nav className={`${isMobileMode ? "hidden" : "hidden md:block"} border-t border-zinc-800/80 bg-zinc-950/80`}>
        <div className="mx-auto flex max-w-7xl items-center justify-start px-4 py-1.5 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => onSelectTab("FEED")}
            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-medium transition shrink-0 ${
              activeTab === "FEED"
                ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <span>📰 Flödet</span>
          </button>

          <button
            onClick={() => onSelectTab("MATES")}
            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-medium transition shrink-0 ${
              activeTab === "MATES"
                ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <span>🎾 Hundkompisar</span>
          </button>

          <button
            onClick={() => onSelectTab("SITTING")}
            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-medium transition shrink-0 ${
              activeTab === "SITTING"
                ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <span>🏠 Hundvakt</span>
          </button>

          <button
            onClick={() => onSelectTab("BREEDS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-medium transition shrink-0 ${
              activeTab === "BREEDS"
                ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <span>📖 Rasguide & Hälsa</span>
          </button>

          <button
            onClick={() => onSelectTab("KENNELS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-medium transition shrink-0 ${
              activeTab === "KENNELS"
                ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <span>🏛️ Kennlar ({kennels.length})</span>
          </button>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on mobile screens or sticky in simulator) */}
      <nav className={`${isMobileMode ? "flex md:sticky md:bottom-0 fixed bottom-0 left-0 right-0" : "md:hidden fixed bottom-0 left-0 right-0"} z-50 border-t border-zinc-800/90 bg-zinc-950/95 backdrop-blur-xl px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl`}>
        <div className="grid grid-cols-5 gap-1 text-[10px] w-full">
          <button
            type="button"
            onClick={() => onSelectTab("FEED")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === "FEED"
                ? "text-amber-400 font-bold bg-amber-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Home className="h-4 w-4 mb-0.5" />
            <span className="truncate">Flöde</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("MATES")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === "MATES"
                ? "text-amber-400 font-bold bg-amber-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4 mb-0.5" />
            <span className="truncate">Kompisar</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("SITTING")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === "SITTING"
                ? "text-amber-400 font-bold bg-amber-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4 mb-0.5" />
            <span className="truncate">Hundvakt</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("BREEDS")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === "BREEDS"
                ? "text-amber-400 font-bold bg-amber-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4 mb-0.5" />
            <span className="truncate">Raser</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("KENNELS")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === "KENNELS"
                ? "text-amber-400 font-bold bg-amber-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Award className="h-4 w-4 mb-0.5" />
            <span className="truncate">Kennlar</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
