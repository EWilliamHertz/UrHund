"use client";

import React, { useState } from "react";
import {
  Home,
  MapPin,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Repeat,
  DollarSign,
  Heart,
  PlusCircle,
  Clock,
} from "lucide-react";
import { DogSitterProfile } from "@/data/mockSocial";

interface DogSittingViewProps {
  sitters: DogSitterProfile[];
  isMobileMode?: boolean;
}

export function DogSittingView({ sitters, isMobileMode = false }: DogSittingViewProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "SWAP" | "PAID">("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [fencedOnly, setFencedOnly] = useState<boolean>(false);
  const [bookedIds, setBookedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredSitters = sitters.filter((sitter) => {
    if (selectedCity !== "ALL" && !sitter.city.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    if (fencedOnly && !sitter.homeType.toLowerCase().includes("inhägnad")) {
      return false;
    }
    return true;
  });

  const handleBook = (sitter: DogSitterProfile) => {
    setBookedIds([...bookedIds, sitter.id]);
    setToastMessage(`Förfrågan om hundpassning skickad till ${sitter.name}! Du får svar inom 30 minuter.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-3.5 text-xs text-indigo-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Hero Header with Clever Swap Feature */}
      {/* Hero Header with Clever Swap Feature */}
      <div className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-2 sm:mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Hundpassning i olika områden</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              Trygg hundvakt eller smart passnings-byte
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs md:text-sm text-zinc-400 leading-relaxed">
              Att lämna en självständig urhund på vanligt hundpensionat fungerar sällan bra.
              Här hittar du rymningssäkra hem med inhägnad tomt och grannar som erbjuder
              både betald passning och smarta <span className="text-indigo-300 font-semibold">hundvakt-bytes</span>.
            </p>
          </div>

          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-500 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-bold text-white hover:bg-indigo-400 transition shadow-lg shadow-indigo-500/20 shrink-0">
            <PlusCircle className="h-4 w-4" />
            <span>Erbjud hundpassning</span>
          </button>
        </div>

        {/* Clever Feature Spotlight: "Hundvakts-Bytes" */}
        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Nyhet: Urhund Swap™ (0 kr Passningsbyte)</span>
                <span className="rounded bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 text-[9px] uppercase font-bold">
                  Populärt
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Passa en hund i ditt område när ägaren reser bort, och få gratis returpassning tillbaka när du själv behöver det!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("SWAP")}
              className={`w-full sm:w-auto rounded-xl px-3 py-1.5 text-xs font-semibold transition text-center ${
                activeTab === "SWAP"
                  ? "bg-indigo-500 text-white font-bold"
                  : "bg-zinc-800 text-zinc-300 hover:text-white"
              }`}
            >
              Visa bytes-profiler
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 sm:pt-6 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap pb-1 text-xs">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`rounded-xl px-3 py-1.5 font-medium transition shrink-0 ${
                activeTab === "ALL"
                  ? "bg-indigo-500 text-white font-bold"
                  : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Alla passare ({sitters.length})
            </button>
            <button
              onClick={() => setActiveTab("PAID")}
              className={`rounded-xl px-3 py-1.5 font-medium transition shrink-0 ${
                activeTab === "PAID"
                  ? "bg-indigo-500 text-white font-bold"
                  : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Betald passning
            </button>
            <button
              onClick={() => setActiveTab("SWAP")}
              className={`rounded-xl px-3 py-1.5 font-medium transition shrink-0 ${
                activeTab === "SWAP"
                  ? "bg-indigo-500 text-white font-bold"
                  : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
            >
              Bytespassning (0 kr)
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Alla städer</option>
              <option value="Stockholm">Stockholm</option>
              <option value="Göteborg">Göteborg</option>
              <option value="Malmö">Malmö</option>
            </select>

            {/* Fenced Garden Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300 text-xs">
              <input
                type="checkbox"
                checked={fencedOnly}
                onChange={(e) => setFencedOnly(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500 h-4 w-4"
              />
              <span>Endast inhägnad tomt</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sitter Cards Grid */}
      <div className={`grid grid-cols-1 ${isMobileMode ? "" : "md:grid-cols-2 lg:grid-cols-3"} gap-4 sm:gap-6`}>
        {filteredSitters.length === 0 ? (
          <div className={`${isMobileMode ? "" : "md:col-span-2 lg:col-span-3"} rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-3`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Inga aktiva hundvakter registrerade i detta område än</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              All placeholder-data har raderats från databasen. Klicka på &quot;Erbjud hundpassning i ditt område&quot; ovan för att lägga till din profil!
            </p>
          </div>
        ) : (
          filteredSitters.map((sitter) => {
            const isBooked = bookedIds.includes(sitter.id);

            return (
              <div
                key={sitter.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-indigo-500/50 transition flex flex-col justify-between shadow-xl shadow-black/30 group"
              >
              <div>
                {/* Sitter Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={sitter.avatar}
                      alt={sitter.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500 shadow-md shadow-indigo-500/20"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        {sitter.name}
                        {sitter.verifiedId && (
                          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                        )}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-0.5">
                        <span className="flex items-center">
                          <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
                          <span className="font-bold">{sitter.rating}</span>
                        </span>
                        <span className="text-zinc-500">({sitter.reviewsCount} omdömen)</span>
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 text-xs font-bold shrink-0">
                    {sitter.ratePerDaySEK} kr/dygn
                  </span>
                </div>

                {/* Badge & Area */}
                <div className="mt-3 space-y-1">
                  <span className="inline-block rounded-md bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 border border-zinc-800">
                    {sitter.badge}
                  </span>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    {sitter.area}, {sitter.city}
                  </p>
                </div>

                {/* Home description */}
                <div className="mt-3.5 rounded-2xl bg-zinc-950/70 p-3 border border-zinc-800/80 text-xs">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 flex items-center gap-1">
                    <Home className="h-3 w-3 text-indigo-400" />
                    Boendemiljö & Säkerhet
                  </div>
                  <p className="text-zinc-200 font-medium">
                    {sitter.homeType}
                  </p>
                </div>

                {/* Bio */}
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                  {sitter.bio}
                </p>

                {/* Accepted Breeds Chips */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1.5">
                    Erfarenhet med:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sitter.acceptsBreeds.map((breed) => (
                      <span
                        key={breed}
                        className="rounded-lg bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-300 border border-zinc-800"
                      >
                        {breed}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  Svarar inom 30 min
                </span>

                <button
                  onClick={() => handleBook(sitter)}
                  disabled={isBooked}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                    isBooked
                      ? "bg-zinc-800 text-zinc-400 cursor-default"
                      : "bg-indigo-500 text-white hover:bg-indigo-400"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{isBooked ? "Förfrågan skickad ✓" : "Boka / Kontakta"}</span>
                </button>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
