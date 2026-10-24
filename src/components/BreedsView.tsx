"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  Wallet,
  Clock,
  Compass,
  HeartPulse,
} from "lucide-react";
import { Breed } from "@/data/breeds";

const TRAIT_LABELS: Record<string, string> = {
  independence: "Självständighet & Integritet",
  guardInstinct: "Vaktinstinkt",
  preyDrive: "Jaktlust",
  grooming: "Pälsvård & Fällning",
  firstTimeFriendly: "Passar Förstagångsägare",
  winterTolerance: "Tålighet för Nordiskt Vinterklimat",
};

interface BreedsViewProps {
  breeds: Breed[];
  selectedBreedId: string;
  onSelectBreedId: (id: string) => void;
}

export function BreedsView({
  breeds,
  selectedBreedId,
  onSelectBreedId,
}: BreedsViewProps) {
  const activeBreed = breeds.find((b) => b.id === selectedBreedId) || breeds[0];

  if (!activeBreed) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
        Inga raser tillgängliga just nu.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breed Selector Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
        {breeds.map((breed) => {
          const isSelected = breed.id === selectedBreedId;
          return (
            <button
              key={breed.id}
              onClick={() => onSelectBreedId(breed.id)}
              className={`group flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "border-amber-500/60 bg-amber-500/15 text-white shadow-md shadow-amber-500/10 font-bold"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <div>
                <div className="text-xs sm:text-sm font-semibold">{breed.name}</div>
                <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400 truncate max-w-[120px]">
                  {breed.origin}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Breed Card with Verified Photo */}
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 aspect-[16/9]">
          <img
            src={activeBreed.image}
            alt={activeBreed.name}
            onError={(e) => {
              e.currentTarget.src = "https://images.dog.ceo/breeds/shiba/shiba-16.jpg";
            }}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <div>
              <span className="rounded-md bg-zinc-950/80 border border-zinc-700 px-2.5 py-1 text-xs text-amber-400">
                {activeBreed.fciGroup}
              </span>
              <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-white">
                {activeBreed.name}{" "}
                <span className="text-zinc-400 font-normal text-sm sm:text-lg">
                  ({activeBreed.nativeName})
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Scale className="h-4 w-4 text-amber-400" />
              <span>Mankhöjd & Vikt</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-white">
              {activeBreed.stats.height} • {activeBreed.stats.weight}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Wallet className="h-4 w-4 text-amber-400" />
              <span>Snittförsäkring</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-white">
              {activeBreed.stats.monthlyInsuranceSEK} / mån
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Aktivering</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-white">
              ~{activeBreed.stats.exerciseHoursPerDay} tim / dag
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Ursprung</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-white">
              {activeBreed.origin}
            </p>
          </div>
        </div>

        {/* Trait Bars */}
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-xl font-bold text-white">{activeBreed.tagline}</h3>
              <p className="mt-1 text-xs text-zinc-400">{activeBreed.description}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {(Object.keys(TRAIT_LABELS) as Array<keyof Breed["traits"]>).map((traitKey) => {
              const val = activeBreed.traits[traitKey];
              return (
                <div key={traitKey} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-300">
                      {TRAIT_LABELS[traitKey]}
                    </span>
                    <span className="text-amber-400 font-semibold">{val}/10</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val * 10}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Check Checklist */}
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-6 w-6 text-amber-400" />
            <div>
              <h3 className="text-lg font-bold text-white">
                Hälsokrav & Avelsdata för {activeBreed.name}
              </h3>
              <p className="text-xs text-zinc-400">
                Verifiera alltid dessa resultat i SKK Avelsdata före köp eller parning.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {activeBreed.healthChecks.map((check) => (
              <div
                key={check.name}
                className="rounded-2xl border border-zinc-800/90 bg-zinc-950/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {check.name}
                    </span>
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-mono">
                      {check.code}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{check.description}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    check.importance === "Kritisk"
                      ? "border border-amber-500/40 bg-amber-500/10 text-amber-300"
                      : "border border-zinc-700 bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {check.importance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
