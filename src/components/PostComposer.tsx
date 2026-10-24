"use client";

import React, { useState, useRef } from "react";
import {
  Send,
  Upload,
  Camera,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { UserRole, UserProfile, Post } from "@/data/mockSocial";

interface PostComposerProps {
  currentRole: UserRole;
  profile: UserProfile;
  onAddPost: (post: Post) => void;
}

export function PostComposer({ currentRole, profile, onAddPost }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [composerType, setComposerType] = useState<"STATUS" | "LITTER" | "PLAYDATE" | "SITTING">("STATUS");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Extra form fields for special post types
  const [sire, setSire] = useState("");
  const [dam, setDam] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [playdatePark, setPlaydatePark] = useState("");
  const [playdateDate, setPlaydateDate] = useState("");
  const [sittingDates, setSittingDates] = useState("");
  const [sittingRate, setSittingRate] = useState("350");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    let postType: Post["postType"] = "STATUS";
    let extraData: Post["extraData"] = undefined;
    const tags: string[] = [];

    if (composerType === "LITTER" && currentRole === "BREEDER") {
      postType = "LITTER_ANNOUNCEMENT";
      tags.push("#Valpkull", "#SKKAvel", "#PlaneradKull");
      extraData = {
        litterDetails: {
          sire: sire || "SE UCH Avelshane",
          dam: dam || "Ch. Avelstik",
          expectedDate: expectedDate || "Vinter 2026",
          availablePuppies: 4,
          healthTests: "HD A • Patella 0 • Ögon U.A",
          status: "Intresseanmälan öppen",
        },
      };
    } else if (composerType === "PLAYDATE") {
      postType = "PLAYDATE_REQUEST";
      tags.push("#Hundkompisar", "#Lekträff", "#Hundrastgård");
      extraData = {
        playdateDetails: {
          preferredDate: playdateDate || "I helgen kl 11:00",
          parkArea: playdatePark || `${profile.city} hundrastgård`,
          dogName: profile.dog ? profile.dog.name : "Vår hund",
          dogBreed: profile.dog ? profile.dog.breedName : "Spets",
          sizePreference: "Alla glada hundar",
          energyLevel: "Hög energi",
        },
      };
    } else if (composerType === "SITTING") {
      postType = "DOG_SITTING";
      tags.push("#Hundvakt", "#Hundpassning", `#${profile.city}`);
      extraData = {
        dogSittingDetails: {
          type: "SÖKER_HUNDVAKT",
          dates: sittingDates || "Kommande helg",
          area: profile.location,
          ratePerDaySEK: parseInt(sittingRate) || 350,
          dogName: profile.dog ? profile.dog.name : "Hunden",
          requirements: "Erfarenhet av spets- eller urhund.",
        },
      };
    }

    const finalImages = images.length > 0 ? images : undefined;
    const primaryImage = images[0] || undefined;

    const newPost: Post = {
      id: `user-post-${Date.now()}`,
      authorId: profile.id,
      authorName: profile.name,
      authorAvatar: profile.avatar,
      authorRole: currentRole,
      authorBadge:
        currentRole === "BREEDER"
          ? profile.registry || "Verifierad SKK-Uppfödare"
          : currentRole === "SEEKING_DOG"
          ? "🐾 Vill skaffa hund"
          : profile.dog
          ? `Ägare till ${profile.dog.name} (${profile.dog.breedName})`
          : "Hundägare",
      city: profile.city,
      timestamp: "Just nu",
      postType,
      content,
      image: primaryImage,
      images: finalImages,
      tags: tags.length > 0 ? tags : ["#UrhundSe", "#HundLiv"],
      likes: 1,
      pawCount: 1,
      hasLiked: true,
      comments: [],
      extraData,
    };

    onAddPost(newPost);
    setContent("");
    setImages([]);
    setComposerType("STATUS");
    setSire("");
    setDam("");
    setExpectedDate("");
    setPlaydatePark("");
    setSittingDates("");
  };

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setIsUploading(true);
    setUploadStatusText(`Laddar upp ${files.length} bild${files.length > 1 ? "er" : ""}...`);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.urls && data.urls.length > 0) {
        setImages((prev) => [...prev, ...data.urls]);
      } else {
        // Fallback: read as data URLs locally so user experience is not disrupted
        const localUrls: string[] = [];
        for (const file of files) {
          const reader = new FileReader();
          const p = new Promise<string>((resolve) => {
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          });
          localUrls.push(await p);
        }
        setImages((prev) => [...prev, ...localUrls]);
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback
      const localUrls: string[] = [];
      for (const file of files) {
        const reader = new FileReader();
        const p = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
        localUrls.push(await p);
      }
      setImages((prev) => [...prev, ...localUrls]);
    } finally {
      setIsUploading(false);
      setUploadStatusText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/60 p-3.5 sm:p-5 md:p-6 shadow-xl shadow-black/40">
      {/* Top Author Info & Composer Type Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border-2 shrink-0 ${
                currentRole === "BREEDER"
                  ? "border-amber-500"
                  : currentRole === "SEEKING_DOG"
                  ? "border-cyan-500"
                  : "border-emerald-500"
              }`}
            />
          ) : (
            <div
              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-xs border-2 shrink-0 ${
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
          <div className="min-w-0">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
              <span className="truncate max-w-[140px] sm:max-w-none">{profile.name}</span>
              {currentRole === "BREEDER" ? (
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400 border border-amber-500/20 font-medium">
                  Kennel
                </span>
              ) : currentRole === "SEEKING_DOG" ? (
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-400 border border-cyan-500/20 font-medium">
                  Vill ha hund
                </span>
              ) : (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20 font-medium">
                  {profile.dog ? `${profile.dog.name}` : "Hundägare"}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
              {currentRole === "BREEDER"
                ? "Publicera till valpsökare & kollegor"
                : currentRole === "SEEKING_DOG"
                ? "Fråga uppfödare & sök valpar"
                : "Dela med hundägare & vänner"}
            </p>
          </div>
        </div>

        {/* Quick Post Type Selector */}
        <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800 text-[11px] overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setComposerType("STATUS")}
            className={`px-2.5 py-1 rounded-lg transition ${
              composerType === "STATUS"
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Inlägg
          </button>

          {currentRole === "BREEDER" && (
            <button
              type="button"
              onClick={() => setComposerType("LITTER")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                composerType === "LITTER"
                  ? "bg-amber-500 text-zinc-950 font-bold"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <span>🍼 Valpkull</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setComposerType("PLAYDATE")}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              composerType === "PLAYDATE"
                ? "bg-emerald-500 text-zinc-950 font-bold"
                : "text-emerald-400 hover:text-emerald-300"
            }`}
          >
            <span>🎾 Lekträff</span>
          </button>

          <button
            type="button"
            onClick={() => setComposerType("SITTING")}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
              composerType === "SITTING"
                ? "bg-indigo-500 text-white font-bold"
                : "text-indigo-400 hover:text-indigo-300"
            }`}
          >
            <span>🏠 Hundvakt</span>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Textarea */}
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            composerType === "LITTER"
              ? "Beskriv kullen, föräldrarnas meriter, BPH/HD-resultat och när valparna väntas..."
              : composerType === "PLAYDATE"
              ? "Söker du leksällskap till din hund? Skriv var och när du vill träffas, samt hundens energi..."
              : composerType === "SITTING"
              ? "Beskriv när du behöver passning eller om du erbjuder passning, samt eventuella rutiner..."
              : currentRole === "BREEDER"
              ? "Dela nyheter från kenneln, träningsframsteg eller tankar kring avel..."
              : "Vad hittar du och din hund på idag? Dela en uppdatering eller ställ en fråga till hundägarna..."
          }
          className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />

        {/* Special Litter Fields */}
        {composerType === "LITTER" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-xs">
            <div>
              <label className="text-[10px] uppercase font-semibold text-amber-300 block mb-1">
                Avelshane (Sire)
              </label>
              <input
                type="text"
                placeholder="T.ex. SE UCH Ryuujin Go"
                value={sire}
                onChange={(e) => setSire(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-amber-300 block mb-1">
                Avelstik (Dam)
              </label>
              <input
                type="text"
                placeholder="T.ex. Ch. Hagakure Sakura"
                value={dam}
                onChange={(e) => setDam(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-amber-300 block mb-1">
                Beräknat datum
              </label>
              <input
                type="text"
                placeholder="T.ex. Vinter 2026"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Special Playdate Fields */}
        {composerType === "PLAYDATE" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-xs">
            <div>
              <label className="text-[10px] uppercase font-semibold text-emerald-300 block mb-1">
                Hundrastgård / Område
              </label>
              <input
                type="text"
                placeholder="T.ex. Rålambshovsparken eller Hagaparken"
                value={playdatePark}
                onChange={(e) => setPlaydatePark(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-emerald-300 block mb-1">
                Tid & Dag
              </label>
              <input
                type="text"
                placeholder="T.ex. Lördag 14:00"
                value={playdateDate}
                onChange={(e) => setPlaydateDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Special Sitting Fields */}
        {composerType === "SITTING" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 text-xs">
            <div>
              <label className="text-[10px] uppercase font-semibold text-indigo-300 block mb-1">
                Datum för passning
              </label>
              <input
                type="text"
                placeholder="T.ex. 20–24 November 2026"
                value={sittingDates}
                onChange={(e) => setSittingDates(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-indigo-300 block mb-1">
                Ersättning (SEK / dygn)
              </label>
              <input
                type="number"
                placeholder="350"
                value={sittingRate}
                onChange={(e) => setSittingRate(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Attached Images Thumbnail Preview Gallery */}
        {images.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">
                {images.length} {images.length === 1 ? "foto bifogat" : "foton bifogade"}
              </span>
              <button
                type="button"
                onClick={() => setImages([])}
                className="text-red-400 hover:text-red-300 text-[10px] transition"
              >
                Rensa alla foton
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 p-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0 shadow-md"
                >
                  <img
                    src={imgUrl}
                    alt={`Bifogat foto ${idx + 1}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center text-xs transition shadow"
                    title="Ta bort foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                    {idx + 1}
                  </span>
                </div>
              ))}

              {/* Add more button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500 bg-zinc-900/50 hover:bg-zinc-900 flex flex-col items-center justify-center text-zinc-400 hover:text-amber-400 transition text-[10px] gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                title="Lägg till fler foton"
              >
                <Plus className="h-4 w-4" />
                <span>Lägg till</span>
              </button>
            </div>
          </div>
        )}

        {/* Uploading progress notification */}
        {isUploading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            <span>{uploadStatusText || "Laddar upp bilder..."}</span>
          </div>
        )}

        {/* Image URL input toggle */}
        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-emerald-500/50 transition">
              <Upload className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {images.length > 0
                  ? `Foton (${images.length})`
                  : "Ladda upp"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300 hover:text-amber-300 hover:border-amber-500/50 transition cursor-pointer"
              title="Ta foto direkt med kamera"
            >
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span>Kamera</span>
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFilesUpload}
              disabled={isUploading}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && images.length === 0) || isUploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Laddar upp...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publicera inlägg</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
