"use client";

import React, { useState } from "react";
import {
  Users,
  MapPin,
  Sparkles,
  Heart,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  MessageCircle,
  PlusCircle,
} from "lucide-react";
import { DogMateProfile } from "@/data/mockSocial";

interface DogMatesViewProps {
  mates: DogMateProfile[];
  isMobileMode?: boolean;
}

export function DogMatesView({ mates, isMobileMode = false }: DogMatesViewProps) {
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedEnergy, setSelectedEnergy] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [showConnectToast, setShowConnectToast] = useState<string | null>(null);

  const filteredMates = mates.filter((mate) => {
    if (selectedCity !== "ALL" && !mate.city.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    if (selectedEnergy !== "ALL" && mate.energyLevel !== selectedEnergy) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        mate.dogName.toLowerCase().includes(q) ||
        mate.breedName.toLowerCase().includes(q) ||
        mate.area.toLowerCase().includes(q) ||
        mate.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConnect = (mate: DogMateProfile) => {
    setConnectedIds([...connectedIds, mate.id]);
    setShowConnectToast(`Lekträff-förfrågan skickad till ${mate.ownerName} & ${mate.dogName}! 🎾`);
    setTimeout(() => setShowConnectToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {showConnectToast && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{showConnectToast}</span>
          </div>
        </div>
      )}

      {/* Hero / Header */}
      <div className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2 sm:mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Hundkompisar & Lekträffar</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              Hitta rätt lekkamrat i ditt område
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs md:text-sm text-zinc-400 leading-relaxed">
              Många spetsar och urhundar leker bäst med hundar som delar samma kroppsspråk
              och lekstil. Filtrera efter stadsdel, energinivå och storlek för harmoniska hundpromenader.
            </p>
          </div>

          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-emerald-500 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 shrink-0">
            <PlusCircle className="h-4 w-4" />
            <span>Registrera hundkompis</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-2.5 pt-4 sm:pt-6 border-t border-zinc-800/80">
          <div className="flex-1 min-w-0 relative">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sök hundnamn, ras eller park..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap pb-1 sm:pb-0">
            {/* City Filter Pills */}
            <div className="flex items-center gap-1 text-xs shrink-0">
              {["ALL", "Stockholm", "Göteborg", "Växjö"].map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-medium transition shrink-0 ${
                    selectedCity === city
                      ? "bg-emerald-500 text-zinc-950 font-bold"
                      : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                  }`}
                >
                  {city === "ALL" ? "Alla städer" : city}
                </button>
              ))}
            </div>

            {/* Energy Filter */}
            <select
              value={selectedEnergy}
              onChange={(e) => setSelectedEnergy(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 shrink-0"
            >
              <option value="ALL">Alla energier</option>
              <option value="Lugn">Lugn</option>
              <option value="Medel">Medel</option>
              <option value="Mycket lekfull & energisk">Hög energi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Dog Mates */}
      <div className={`grid grid-cols-1 ${isMobileMode ? "" : "md:grid-cols-2"} gap-4 sm:gap-6`}>
        {filteredMates.length === 0 ? (
          <div className={`${isMobileMode ? "" : "md:col-span-2"} rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-3`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Inga hundkompisar registrerade i detta område än</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              All placeholder-data har raderats. Klicka på &quot;Registrera din hund som kompis&quot; ovan för att lägga till din hund i databasen!
            </p>
          </div>
        ) : (
          filteredMates.map((mate) => {
            const isConnected = connectedIds.includes(mate.id);

            return (
              <div
                key={mate.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-emerald-500/50 transition flex flex-col justify-between shadow-xl shadow-black/30 group"
              >
              <div>
                {/* Photo & Quick Tags */}
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[16/10] mb-4">
                  <img
                    src={mate.image}
                    alt={mate.dogName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-zinc-950/80 border border-zinc-700/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md">
                      {mate.breedName} • {mate.age}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-emerald-500/90 text-zinc-950 px-2.5 py-1 text-[11px] font-bold backdrop-blur-md">
                      {mate.distanceKm} km bort
                    </span>
                  </div>
                </div>

                {/* Info Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {mate.dogName}
                      <span className="text-xs text-zinc-400 font-normal">
                        ({mate.gender})
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      {mate.area}, {mate.city}
                    </p>
                  </div>

                  {/* Owner snippet */}
                  <div className="flex items-center gap-2 text-right">
                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold text-zinc-200">
                        {mate.ownerName}
                      </div>
                      <div className="text-[10px] text-zinc-500">Ägare</div>
                    </div>
                    <img
                      src={mate.ownerAvatar}
                      alt={mate.ownerName}
                      className="h-8 w-8 rounded-full object-cover border border-zinc-700"
                    />
                  </div>
                </div>

                {/* About dog */}
                <p className="mt-3 text-xs text-zinc-300 leading-relaxed">
                  {mate.about}
                </p>

                {/* Friendly With Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 mr-1 self-center">
                    Gillar:
                  </span>
                  {mate.friendlyWith.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-lg bg-zinc-950 px-2 py-0.5 text-[11px] text-emerald-300 border border-zinc-800"
                    >
                      {trait}
                    </span>
                  ))}
                  <span className="rounded-lg bg-zinc-950 px-2 py-0.5 text-[11px] text-amber-300 border border-zinc-800">
                    Energi: {mate.energyLevel}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-emerald-400" />
                  Ledig för promenad i helgen
                </span>

                <button
                  onClick={() => handleConnect(mate)}
                  disabled={isConnected}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                    isConnected
                      ? "bg-zinc-800 text-zinc-400 cursor-default"
                      : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{isConnected ? "Förfrågan skickad ✓" : "Bjud in till lekträff"}</span>
                </button>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
