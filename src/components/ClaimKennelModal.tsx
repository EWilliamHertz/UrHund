"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, CheckCircle2, Building2, Send, AlertCircle } from "lucide-react";
import { Kennel } from "@/data/breeds";

interface ClaimKennelModalProps {
  isOpen: boolean;
  kennel: Kennel | null;
  onClose: () => void;
  onClaimSuccess: (kennelId: string, claimantName: string) => void;
}

export function ClaimKennelModal({
  isOpen,
  kennel,
  onClose,
  onClaimSuccess,
}: ClaimKennelModalProps) {
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [skkMemberNumber, setSkkMemberNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  if (!isOpen || !kennel) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/kennels/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kennelId: kennel.id,
          claimantName,
          claimantEmail,
          skkMemberNumber,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kunde inte registrera anspråk.");
      }

      setSuccessMsg(data.message);
      onClaimSuccess(kennel.id, claimantName);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 2500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Ett fel uppstod vid anspråket.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-2xl text-zinc-100 my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verifiering av Kennelanspråk
            </span>
            <h2 className="text-xl font-bold text-white">Gör anspråk på {kennel.name}</h2>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-6">
          Om detta är din kennel kan du göra anspråk på denna sida för att uppdatera kullar, redigera information, lägga till foton och ta emot intresseanmälningar från seriösa valpköpare.
        </p>

        {successMsg ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-emerald-300">Anspråk registrerat!</h3>
            <p className="text-xs text-zinc-300">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Ditt namn / Innehavare
              </label>
              <input
                type="text"
                required
                placeholder="T.ex. Elisabeth Bäckström"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Officiell kontakt-e-post för kenneln
              </label>
              <input
                type="email"
                required
                placeholder="kennel@exempel.se"
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Använd helst den e-postadress som finns registrerad hos SKK{kennel.website ? ` eller på er officiella hemsida (${kennel.website})` : " eller i medlemsregistret"}.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                SKK Uppfödarnummer / Medlemsnummer (Valfritt)
              </label>
              <input
                type="text"
                placeholder="T.ex. SKK-123456"
                value={skkMemberNumber}
                onChange={(e) => setSkkMemberNumber(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Meddelande eller verifieringsanteckning (Valfritt)
              </label>
              <textarea
                rows={2}
                placeholder="Berätta kort om er verksamhet eller länka till er Instagram/Facebook..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Avbryt
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Registrerar...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Gör anspråk på kenneln</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
