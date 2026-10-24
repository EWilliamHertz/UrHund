"use client";

import React, { useState, useRef } from "react";
import { X, Send, Camera, Upload, Loader2, Trash2 } from "lucide-react";
import { UserProfile, UserRole } from "@/data/mockSocial";
import { CanineStory } from "./StoryViewerModal";

interface StoryCreatorModalProps {
  isOpen: boolean;
  profile: UserProfile;
  currentRole: UserRole;
  onClose: () => void;
  onAddStory: (story: CanineStory) => void;
}

export function StoryCreatorModal({
  isOpen,
  profile,
  onClose,
  onAddStory,
}: StoryCreatorModalProps) {
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    // 1. Immediately read as local data URL for instant feedback
    const reader = new FileReader();
    reader.onload = async (event) => {
      const localUrl = event.target?.result as string;
      setPhotoDataUrl(localUrl);

      // 2. Upload to /api/upload in background to get a permanent hosted image URL if possible
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setPhotoDataUrl(data.url);
          }
        }
      } catch (err) {
        console.warn("Upload service fallback to local image:", err);
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError("Kunde inte läsa bilden från din enhet.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) {
      setUploadError("Välj eller ta ett foto först.");
      return;
    }

    const dog = profile.dogs?.[0] || profile.dog;
    const dogName = dog?.name || (profile.name !== "Hundägare" ? profile.name : "Kompisen");
    const breedName = dog?.breedName || "Asiatisk Urhund";

    const newStory: CanineStory = {
      id: `story-${Date.now()}`,
      authorName: profile.name,
      authorAvatar:
        profile.avatar ||
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      dogName,
      breedName,
      city: profile.city || "Sverige",
      mediaUrl: photoDataUrl,
      caption: caption || `Dagens händelse med ${dogName}! 🐾`,
      timestamp: "Just nu",
      views: 1,
    };

    onAddStory(newStory);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto"
    >
      {/* Scrollable Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto my-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          title="Stäng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Dela dagens händelse</h3>
            <p className="text-xs text-zinc-400">
              Syns för hela UrHund-gemenskapen under 24 timmar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Preview / Upload Area */}
          {photoDataUrl ? (
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
              <img
                src={photoDataUrl}
                alt="Valt foto för händelse"
                className="h-full w-full object-cover"
              />
              {caption && (
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/75 backdrop-blur-sm p-2.5 text-xs text-white">
                  {caption}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 text-xs font-semibold text-amber-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Optimerar foto...</span>
                </div>
              )}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[11px] font-medium text-white shadow-lg transition"
                >
                  Byt bild
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl("")}
                  className="rounded-xl bg-red-500/80 hover:bg-red-600 p-1.5 text-white shadow-lg transition"
                  title="Ta bort bild"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/40 p-6 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 mx-auto">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Välj ett foto på din hund</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Ladda upp direkt från din telefon eller dator
                </p>
              </div>

              {/* Upload buttons: Device & Camera */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 text-xs font-bold text-white border border-zinc-700 transition cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-amber-400" />
                  <span>Ladda upp från enhet</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-4 py-2.5 text-xs font-bold text-amber-300 transition cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Ta foto med kamera</span>
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 text-center">
              {uploadError}
            </div>
          )}

          {/* Caption Input */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
              Bildtext / Hälsning:
            </label>
            <input
              type="text"
              placeholder="Vad händer idag? (t.ex. 'Morgonpromenad i snön med Milo!')"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              maxLength={120}
            />
            <span className="text-[10px] text-zinc-500 block text-right mt-1">
              {caption.length}/120 tecken
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={!photoDataUrl || isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:from-amber-400 hover:to-orange-400 transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              <span>Publicera händelse (24 timmar)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
