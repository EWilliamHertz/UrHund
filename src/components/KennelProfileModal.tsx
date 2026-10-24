"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  MapPin,
  Globe2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Building2,
  Dog,
  AlertCircle,
  Trash2,
  Check,
  Award,
  ZoomIn,
  Phone,
  Mail,
  Send,
  Heart,
  ChevronDown,
} from "lucide-react";
import { Kennel } from "@/data/breeds";
import { ALL_WORLD_BREEDS } from "@/data/allWorldBreeds";

// Map breed ID to official SKK and Köpahund URL slugs
export function getSkkBreedSlug(kennel: Kennel): string {
  const breedId = kennel.breedIds[0] || "";
  const map: Record<string, string> = {
    "shiba-inu": "shiba",
    "shiba": "shiba",
    "japanese-akita": "akita",
    "akita": "akita",
    "american-akita": "american-akita",
    "basenji": "basenji",
    "hokkaido": "hokkaido",
    "kai-ken": "kai",
    "kai": "kai",
    "kishu": "kishu",
    "shikoku": "shikoku",
    "thai-ridgeback": "thai-ridgeback-dog",
    "thai-ridgeback-dog": "thai-ridgeback-dog",
    "samojedhund": "samojedhund",
    "siberian-husky": "siberian-husky",
    "alaskan-malamute": "alaskan-malamute",
    "chow-chow": "chow-chow",
    "eurasier": "eurasier",
    "jamthund": "jamthund",
    "norrbottenspets": "norrbottenspets",
    "finsk-spets": "finsk-spets",
    "islandsk-farhund": "islandsk-farhund",
    "karelsk-bjornhund": "karelsk-bjornhund",
  };
  return map[breedId] || breedId.replace(/[^a-z0-9-]/g, "") || "shiba";
}

export function getSkkUrl(kennel: Kennel): string {
  if (kennel.kopahundUrl && kennel.kopahundUrl.startsWith("https://www.skk.se/")) {
    return kennel.kopahundUrl;
  }
  const slug = getSkkBreedSlug(kennel);
  return `https://www.skk.se/hundraser/${slug}/`;
}

export function getKopahundPuppiesUrl(kennel: Kennel): string {
  const slug = getSkkBreedSlug(kennel);
  return `https://www.kopahund.se/hundraser/${slug}/`;
}

// Kept for backward compatibility
export function getKopahundUrl(kennel: Kennel): string {
  return getKopahundPuppiesUrl(kennel);
}

interface KennelProfileModalProps {
  isOpen: boolean;
  kennel: Kennel | null;
  onClose: () => void;
  onClaim: (kennel: Kennel) => void;
  onOptOut: (kennelId: string, kennelName: string) => void;
}

export function KennelProfileModal({
  isOpen,
  kennel,
  onClose,
  onClaim,
  onOptOut,
}: KennelProfileModalProps) {
  const [showOptOutConfirm, setShowOptOutConfirm] = useState(false);
  const [optOutReason, setOptOutReason] = useState("");
  const [isOptingOut, setIsOptingOut] = useState(false);
  const [optOutDone, setOptOutDone] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Inquiry / puppy application state
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryExperience, setInquiryExperience] = useState("Har haft hund tidigare");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  // Auto-fill inquiry fields from current logged in user if available
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        try {
          const stored = localStorage.getItem("urhund_active_user");
          if (stored) {
            const u = JSON.parse(stored);
            if (u.name && u.name !== "Hundägare" && u.name !== "Vill skaffa hund") {
              setInquiryName(u.name);
            }
            if (u.email) {
              setInquiryEmail(u.email);
            }
            if (u.phone) {
              setInquiryPhone(u.phone);
            }
          }
        } catch {}
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewPhoto) {
          setPreviewPhoto(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, previewPhoto]);

  if (!isOpen || !kennel) return null;

  // Resolve breed names
  const breedNames = kennel.breedIds.map((bid) => {
    const found = ALL_WORLD_BREEDS.find((b) => b.id === bid);
    return found ? found.name : bid;
  });

  const handleConfirmOptOut = async () => {
    setIsOptingOut(true);
    try {
      await fetch("/api/kennels/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kennelId: kennel.id,
          claimantName: "Opt-out Begäran",
          claimantEmail: "optout@urhund.se",
          message: `Avnotering begärd för ${kennel.name}. Orsak: ${optOutReason || "Önskar ej synas"}`,
        }),
      });
      setOptOutDone(true);
      setTimeout(() => {
        onOptOut(kennel.id, kennel.name);
        onClose();
        setShowOptOutConfirm(false);
        setOptOutDone(false);
      }, 1800);
    } catch {
      setIsOptingOut(false);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);

    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
      setInquiryError("Vänligen fyll i ditt namn, e-postadress och meddelande.");
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      const res = await fetch("/api/kennels/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kennelId: kennel.id,
          kennelName: kennel.name,
          senderName: inquiryName.trim(),
          senderEmail: inquiryEmail.trim(),
          senderPhone: inquiryPhone.trim() || null,
          preferredBreed: breedNames[0] || null,
          experienceLevel: inquiryExperience,
          message: inquiryMessage.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Kunde inte skicka intresseanmälan.");
      }

      setInquirySubmitted(true);
      setInquiryMessage("");
    } catch (err: unknown) {
      setInquiryError(err instanceof Error ? err.message : "Något gick fel vid sändning.");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const skkGuideUrl = getSkkUrl(kennel);
  const kopahundPuppyUrl = getKopahundPuppiesUrl(kennel);
  const clubUrl = kennel.clubUrl || "https://www.ssuk.se";

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto py-6 sm:py-10"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-2xl text-zinc-100 my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition z-10"
          title="Stäng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Real Dog Photo / Hero Banner */}
        {kennel.image && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 mb-5 shadow-lg group">
            <img
              src={kennel.image}
              alt={`Hundar hos ${kennel.name}`}
              onError={(e) => {
                e.currentTarget.src = "https://images.dog.ceo/breeds/shiba/shiba-16.jpg";
              }}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                <Dog className="h-3.5 w-3.5 text-amber-400" />
                {breedNames.join(", ")}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPreviewPhoto({
                    url: kennel.image!,
                    title: `${kennel.name} — ${breedNames.join(", ")}`,
                    subtitle: "🐾 Verifierad avelshund / kennelbild",
                  })
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-xs text-white backdrop-blur-md border border-white/10 transition cursor-pointer"
              >
                <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                <span>Förstora foto</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Cover / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-zinc-800/80">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 text-2xl font-bold shrink-0 shadow-lg shadow-amber-500/10">
            犬
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {kennel.registry}
              </span>
              {kennel.verifiedHealthTests && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Hälsotestade avelsdjur
                </span>
              )}
              {kennel.claimed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verifierad ägare
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {kennel.name}
            </h1>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
              {kennel.city}, {kennel.country}
            </p>

            {/* Informative description text prominently in the header */}
            {kennel.description && (
              <div className="mt-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 sm:p-4 text-xs sm:text-sm text-zinc-200 leading-relaxed shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Om {kennel.name}
                </span>
                <p>{kennel.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Contact Bar & Inquiry CTA */}
        <div className="pt-4 pb-2 flex flex-wrap items-center gap-2.5">
          {kennel.phone && (
            <a
              href={`tel:${kennel.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-xs text-zinc-200 hover:text-white transition"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>{kennel.phone}</span>
            </a>
          )}

          {kennel.contactEmail && (
            <a
              href={`mailto:${kennel.contactEmail}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-xs text-zinc-200 hover:text-white transition"
            >
              <Mail className="h-3.5 w-3.5 text-amber-400" />
              <span>{kennel.contactEmail}</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setShowInquiryForm(!showInquiryForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 text-xs font-bold transition shadow-sm ml-auto"
          >
            <Heart className="h-3.5 w-3.5 fill-amber-400/30 text-amber-400" />
            <span>{showInquiryForm ? "Dölj intresseanmälan" : "🐾 Skicka intresseanmälan"}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showInquiryForm ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Direct Inquiry Form (Collapsible) */}
        {showInquiryForm && (
          <div className="my-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase font-bold text-amber-300 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-amber-400" />
                  Intresseanmälan till {kennel.name}
                </span>
                <p className="text-[11px] text-zinc-400">
                  Berätta kort om din livssituation och dina tankar kring att välkomna en valp.
                </p>
              </div>
            </div>

            {inquirySubmitted ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-emerald-300">Intresseanmälan mottagen!</h4>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                  Ditt meddelande har registrerats och förmedlas till {kennel.name}. Kenneln återkopplar via e-post eller telefon.
                </p>
                <button
                  type="button"
                  onClick={() => setInquirySubmitted(false)}
                  className="mt-2 text-xs text-amber-400 hover:underline"
                >
                  Skicka ett till meddelande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3.5">
                {inquiryError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{inquiryError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-300 font-semibold block mb-1">
                      Ditt fullständiga namn *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="För- och efternamn"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-300 font-semibold block mb-1">
                      Din e-postadress *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="namn@exempel.se"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-300 font-semibold block mb-1">
                      Telefonnummer (valfritt)
                    </label>
                    <input
                      type="tel"
                      placeholder="t.ex. 070-123 45 67"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-300 font-semibold block mb-1">
                      Erfarenhet av hundar / urhundar
                    </label>
                    <select
                      value={inquiryExperience}
                      onChange={(e) => setInquiryExperience(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Förstagångsägare">Förstagångsägare (vill lära mig mer)</option>
                      <option value="Har haft hund tidigare">Har haft hund tidigare (annan ras)</option>
                      <option value="Haft denna ras tidigare">Har haft denna ras tidigare</option>
                      <option value="Erfaren urhundsägare">Erfaren urhunds- / spetsägare</option>
                      <option value="Intresserad av avel/utställning">Intresserad av utställning / avel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-300 font-semibold block mb-1">
                    Meddelande / Presentation av ditt hem & vardag *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Beskriv t.ex. boendeform, hur mycket tid hunden kommer vara ensam, planerade aktiviteter eller om du har önskemål om kön/färg..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-zinc-950 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmittingInquiry ? "Skickar..." : "Skicka intresseanmälan"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Breeds & Information Body */}
        <div className="py-4 space-y-5 text-xs">
          {/* Breeds Bred */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Uppfödda Raser i Registret:
            </span>
            <div className="flex flex-wrap gap-2">
              {breedNames.map((name, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                >
                  <Dog className="h-3.5 w-3.5 text-amber-400" />
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Description / Breeding Philosophy */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              📖 Om Kenneln & Avelsfilosofi
            </span>
            <p className="text-zinc-200 leading-relaxed text-xs sm:text-sm">
              {kennel.description ||
                "Auktoriserad uppfödare ansluten till SKK (Svenska Kennelklubben). Följer grundreglerna för hälsotestning och mentalitetsbeskrivning (BPH/MH)."}
            </p>
          </div>

          {/* Health Testing & Litters Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Hälsostatus & Avelsdata
              </span>
              <p className="text-zinc-200 font-semibold">
                {kennel.verifiedHealthTests
                  ? "Dokumenterade hälsotester (HD, Patella, Ögon)"
                  : "Under validering"}
              </p>
              <p className="text-[11px] text-zinc-400">
                Föräldradjur registreras i SKK:s och rasklubbens officiella register.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Kullplanering
              </span>
              <p className="text-zinc-200 font-semibold">
                {kennel.planningLitter && kennel.nextLitterEstimate
                  ? `Planerad kull: ${kennel.nextLitterEstimate}`
                  : "Inga officiella kullar annonserade just nu"}
              </p>
              <p className="text-[11px] text-zinc-400">
                Kontakta kenneln ovan för köplats eller intresseanmälan.
              </p>
            </div>
          </div>

          {/* Active Litters & Puppies Presentation */}
          {kennel.litters && kennel.litters.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  Kullar & Valppresentation
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Dokumenterad kull
                </span>
              </div>

              {kennel.litters.map((litter, lIdx) => (
                <div key={lIdx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{litter.name}</h4>
                      {litter.birthDate && (
                        <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-amber-400" />
                          Födda: {litter.birthDate}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                      {litter.status}
                    </span>
                  </div>

                  {/* Main Litter Photo */}
                  {litter.litterPhoto && (
                    <div
                      onClick={() =>
                        setPreviewPhoto({
                          url: litter.litterPhoto,
                          title: litter.name,
                          subtitle: "🐾 Hela kullen tillsammans",
                        })
                      }
                      className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[16/9] relative group cursor-pointer hover:border-amber-500/50 transition shadow-sm"
                      title="Klicka för att förstora fotot på kullen"
                    >
                      <img
                        src={litter.litterPhoto}
                        alt="Hela kullen"
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] text-white font-medium flex items-center gap-1.5">
                        <ZoomIn className="h-3 w-3 text-amber-400" />
                        <span>🐾 Hela kullen tillsammans (Klicka för stor bild)</span>
                      </div>
                    </div>
                  )}

                  {/* Separate Puppy Photos */}
                  {litter.puppies && litter.puppies.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                          Separata valpar i kullen (Klicka för att förstora):
                        </span>
                        <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                          <ZoomIn className="h-3 w-3" />
                          Klicka på en valp
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {litter.puppies.map((pup, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() =>
                              setPreviewPhoto({
                                url: pup.image,
                                title: pup.name,
                                subtitle: `${pup.gender} • ${pup.color} • ${pup.status || "Tillgänglig"}`,
                              })
                            }
                            className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/90 group hover:border-amber-500/60 hover:scale-[1.02] transition shadow-sm cursor-pointer"
                            title={`Klicka för att se ${pup.name} i full storlek`}
                          >
                            <div className="aspect-square w-full overflow-hidden bg-zinc-950 relative">
                              <img
                                src={pup.image}
                                alt={pup.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <span className="p-1.5 rounded-full bg-black/75 text-white">
                                  <ZoomIn className="h-4 w-4 text-amber-400" />
                                </span>
                              </div>
                            </div>
                            <div className="p-2 text-[11px]">
                              <div className="font-bold text-white group-hover:text-amber-300 transition truncate">
                                {pup.name}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">
                                {pup.gender} • {pup.color}
                              </div>
                              {pup.status && (
                                <div className="mt-1">
                                  <span
                                    className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                      pup.status === "Ledig"
                                        ? "text-emerald-300 bg-emerald-500/20 border border-emerald-500/30"
                                        : "text-amber-300 bg-amber-500/20 border border-amber-500/30"
                                    }`}
                                  >
                                    {pup.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dog Photo Gallery */}
          {kennel.photos && kennel.photos.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Dog className="h-3.5 w-3.5" />
                  Galleri: Kennels Hundar ({kennel.photos.length} foton)
                </span>
                <span className="text-[10px] text-zinc-400">Klicka på en bild för att förstora</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {kennel.photos.map((photo, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() =>
                      setPreviewPhoto({
                        url: photo,
                        title: `${kennel.name} — Hundfoto ${pIdx + 1}`,
                        subtitle: breedNames.join(", "),
                      })
                    }
                    className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 group cursor-pointer hover:border-amber-500/50 transition shadow-sm"
                  >
                    <img
                      src={photo}
                      alt={`Hundfoto ${pIdx + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.dog.ceo/breeds/shiba/shiba-16.jpg";
                      }}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                      <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VERIFIED EXTERNAL LINKS & REGISTRY CARDS */}
          <div className="pt-2 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Verifierade Länkar & Officiella Register
            </span>

            {/* 1. Official Kennel Website (if available) */}
            {kennel.website && (
              <a
                href={kennel.website}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between gap-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/80 p-3.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition shadow-sm group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Officiell Kennelwebbplats</span>
                    <span className="truncate text-white group-hover:text-amber-300 transition">
                      {kennel.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-amber-400 shrink-0 font-semibold">
                  <span>Besök hemsida</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>
            )}

            {/* 2. Official SKK Rasguide & Hälsokrav */}
            <a
              href={skkGuideUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between gap-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/80 p-3.5 text-xs text-zinc-200 transition shadow-sm group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-1.5">
                    <span>SKK Rasguide & Hälsoprogram</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full font-semibold">
                      SKK
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Officiell rasstandard, hälsokrav och avelsregler hos Svenska Kennelklubben
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs text-emerald-400 shrink-0 font-semibold">
                <span>Läs rasguide</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>

            {/* 3. Official Köpahund.se Puppies Page */}
            <a
              href={kopahundPuppyUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between gap-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/80 p-3.5 text-xs text-zinc-200 transition shadow-sm group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                  <Dog className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition flex items-center gap-1.5">
                    <span>Köpahund.se — SKK:s Valpförmedling</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Sök SKK-registrerade kullar och uppfödarkontakt via Köpahund
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs text-amber-400 shrink-0 font-semibold">
                <span>Öppna Köpahund</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>

            {/* 4. Official Breed Club / Specialklubb */}
            {clubUrl && (
              <a
                href={clubUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between gap-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800/80 p-3.5 text-xs text-zinc-200 transition shadow-sm group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 border border-cyan-500/20">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition flex items-center gap-1.5">
                      <span>Officiell Specialklubb / Rasklubb</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.2 rounded-full font-semibold">
                        Auktoriserad
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Rasspecifik avelsstrategi (RAS), utställningar och rasklubbsgemenskap
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-cyan-400 shrink-0 font-semibold">
                  <span>Besök rasklubb</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Ownership & Opt-Out Notice */}
        <div className="mt-4 pt-5 border-t border-zinc-800/80">
          {!showOptOutConfirm ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  Är detta din kennel?
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Om detta är din kennel/sida kan du ta kontroll över den för att uppdatera kullar, valppresentationer och kontaktuppgifter. Om du inte vill vara med på UrHund.se kan du meddela oss så tar vi bort sidan.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onClaim(kennel);
                  }}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 transition shadow-lg shadow-amber-500/20 text-center"
                >
                  Ta kontroll över sidan (Gör anspråk) →
                </button>

                <button
                  type="button"
                  onClick={() => setShowOptOutConfirm(true)}
                  className="text-[11px] text-zinc-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-rose-500/30 transition text-center"
                >
                  Vill du inte vara med på UrHund.se? Klicka här
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-3 text-xs animate-fade-in">
              {optOutDone ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold py-2">
                  <Check className="h-4 w-4" />
                  <span>Tack! Er begäran har registrerats och sidan avnoteras från UrHund.se.</span>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Avnotera {kennel.name} från UrHund.se</p>
                      <p className="text-[11px] text-zinc-300 mt-0.5">
                        Vi respekterar självklart din önskan som uppfödare. Kenneln tas bort från det offentliga registret.
                      </p>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Valfri orsak (t.ex. har avslutat avel, vill ej synas)..."
                    value={optOutReason}
                    onChange={(e) => setOptOutReason(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowOptOutConfirm(false)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      Avbryt
                    </button>
                    <button
                      type="button"
                      disabled={isOptingOut}
                      onClick={handleConfirmOptOut}
                      className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-1.5 text-xs font-bold text-white transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{isOptingOut ? "Tar bort..." : "Bekräfta och ta bort"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Enlarged Photo Preview */}
      {previewPhoto && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewPhoto(null);
            }
          }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 sm:right-2 p-2 rounded-full bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
              title="Stäng bild"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl max-h-[75vh] w-auto">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-base font-bold text-white">{previewPhoto.title}</h3>
              {previewPhoto.subtitle && (
                <p className="text-xs text-amber-400 mt-0.5 font-medium">{previewPhoto.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
