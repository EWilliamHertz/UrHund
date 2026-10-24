"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Heart, ShieldCheck, Users, Sparkles, MapPin, ArrowRight, Search, X } from "lucide-react";
import { UserRole } from "@/data/mockSocial";

interface RoleSelectorModalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRole) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export function RoleSelectorModal({
  isOpen,
  onSelectRole,
  onClose,
  canDismiss = false,
}: RoleSelectorModalProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto py-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/95 p-6 md:p-10 shadow-2xl shadow-black/80 my-auto"
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition z-10"
              title="Stäng"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Välkommen till Urhund.se — Social Hub för Hundfolk</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Vem är du i hundvärlden?
            </h2>
            <p className="mt-2 text-sm md:text-base text-zinc-400">
              Välj den roll som passar dig bäst. Du kan när som helst byta läge i menyn!
            </p>
          </div>

          {/* Three Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Dog Owner */}
            <button
              onClick={() => onSelectRole("DOG_OWNER")}
              className="group relative flex flex-col justify-between text-left rounded-2xl border-2 border-zinc-800 bg-zinc-950/70 p-6 hover:border-emerald-500 hover:bg-zinc-900/90 transition-all shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="absolute top-4 right-4">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  Hundägare
                </span>
              </div>

              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition">
                  Jag är hundägare
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  För dig som har en eller flera hundar. Registrera dina hundar med bilder, hitta lekträffar i närområdet och trygg hundvakt.
                </p>

                <ul className="mt-5 space-y-2 text-[11px] text-zinc-300 border-t border-zinc-800/80 pt-4">
                  <li className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Lekträffar (Dog Mates) i ditt område</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Hitta hundvakt & grannpassning</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Lägg till flera hundar med egna foton</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300">
                  Välj Hundägare
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>

            {/* Card 2: Breeder / Kennel */}
            <button
              onClick={() => onSelectRole("BREEDER")}
              className="group relative flex flex-col justify-between text-left rounded-2xl border-2 border-zinc-800 bg-zinc-950/70 p-6 hover:border-amber-500 hover:bg-zinc-900/90 transition-all shadow-lg hover:shadow-amber-500/10"
            >
              <div className="absolute top-4 right-4">
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                  Kennelportal
                </span>
              </div>

              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition">
                  Jag är uppfödare / kennel
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  För dig med kennel registrerad i SKK, NIPPO eller FCI. Visa stamtavlor, dokumentera hälsotester och annonsera planerade valpkullar.
                </p>

                <ul className="mt-5 space-y-2 text-[11px] text-zinc-300 border-t border-zinc-800/80 pt-4">
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>Publicera verifierade valpkullar & planer</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>Nå seriösa valpköpare direkt</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>Dokumentera HD/ED, BPH & stamtavla</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 group-hover:text-amber-300">
                  Välj Uppfödare
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>

            {/* Card 3: Looking to get a dog / Prospective Owner */}
            <button
              onClick={() => onSelectRole("SEEKING_DOG")}
              className="group relative flex flex-col justify-between text-left rounded-2xl border-2 border-zinc-800 bg-zinc-950/70 p-6 hover:border-cyan-500 hover:bg-zinc-900/90 transition-all shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="absolute top-4 right-4">
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300">
                  Valpköpare / Sökare
                </span>
              </div>

              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                  Jag vill skaffa hund
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  För dig som drömmer om att bli hundägare. Hitta godkända kennlar, följ planerade valpkullar och få personliga råd om rätt ras.
                </p>

                <ul className="mt-5 space-y-2 text-[11px] text-zinc-300 border-t border-zinc-800/80 pt-4">
                  <li className="flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Utforska alla världens hundraser</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Direktkontakt med verifierade kennlar</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Litter-bevakning & valpanmälningar</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 group-hover:text-cyan-300">
                  Välj Jag vill skaffa hund
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          </div>

          {canDismiss && onClose && (
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition underline underline-offset-4"
              >
                Fortsätt med tidigare val
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
