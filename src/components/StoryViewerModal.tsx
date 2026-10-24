"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  MapPin,
  Send,
  Eye,
} from "lucide-react";

export interface CanineStory {
  id: string;
  authorName: string;
  authorAvatar: string;
  dogName: string;
  breedName: string;
  city: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
  views: number;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  stories: CanineStory[];
  initialIndex?: number;
  onClose: () => void;
}

export function StoryViewerModal({
  isOpen,
  stories,
  initialIndex = 0,
  onClose,
}: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reactionSent, setReactionSent] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when initialIndex changes using React state adjustment pattern
  if (initialIndex !== prevInitialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, stories.length - 1)));
    setProgress(0);
  }

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  // Story progress timer (5 seconds per story)
  useEffect(() => {
    if (!isOpen || isPaused || stories.length === 0) return;

    const intervalMs = 50;
    const step = (intervalMs / 5000) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, currentIndex, stories.length, onClose]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  const sendReaction = (emoji: string) => {
    setReactionSent(emoji);
    setTimeout(() => setReactionSent(null), 2000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendReaction(`💬 Skickat: "${replyText}"`);
    setReplyText("");
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-2 sm:p-4 select-none"
    >
      {/* Reaction popup */}
      {reactionSent && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-60 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-2xl animate-bounce">
          {reactionSent}
        </div>
      )}

      {/* Main Story Container */}
      <div
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative w-full max-w-sm sm:max-w-md h-[85vh] max-h-[750px] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col justify-between shadow-2xl"
      >
        {/* Background Image */}
        <img
          src={currentStory.mediaUrl}
          alt={currentStory.dogName}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

        {/* Tap areas for next/prev navigation */}
        <div className="absolute inset-0 flex z-10">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="w-1/3 h-full cursor-pointer"
            title="Föregående händelse"
          />
          <div className="w-1/3 h-full" />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="w-1/3 h-full cursor-pointer"
            title="Nästa händelse"
          />
        </div>

        {/* Top Header: Segmented Progress Bar + Author */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div
                key={s.id}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width:
                      idx < currentIndex
                        ? "100%"
                        : idx === currentIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author Details & Close */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStory.authorAvatar}
                alt={currentStory.authorName}
                className="h-9 w-9 rounded-full object-cover border-2 border-amber-400"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold leading-tight">
                  <span>{currentStory.dogName}</span>
                  <span className="text-[10px] text-amber-300 font-normal">
                    ({currentStory.breedName})
                  </span>
                </div>
                <div className="text-[10px] text-zinc-300 flex items-center gap-1">
                  <span>{currentStory.authorName}</span>
                  <span>•</span>
                  <span>{currentStory.timestamp}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
              title="Stäng (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Area: Caption, Location, Reactions & Reply */}
        <div className="relative z-20 p-4 space-y-3">
          {/* Caption & Location */}
          <div className="space-y-1 text-white">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
              <MapPin className="h-3 w-3" />
              <span>{currentStory.city}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed drop-shadow-md">
              {currentStory.caption}
            </p>
          </div>

          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => sendReaction("🐾 Tass skickad!")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 hover:bg-amber-500 hover:text-zinc-950 border border-white/20 text-xs font-bold text-white transition backdrop-blur-sm cursor-pointer"
              >
                <span>🐾</span>
                <span>Tass</span>
              </button>
              <button
                onClick={() => sendReaction("❤️ Kärlek skickad!")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 hover:bg-rose-500 text-white border border-white/20 text-xs font-bold transition backdrop-blur-sm cursor-pointer"
              >
                <span>❤️</span>
              </button>
              <button
                onClick={() => sendReaction("🎾 Boll kastad!")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 hover:bg-emerald-500 text-white border border-white/20 text-xs font-bold transition backdrop-blur-sm cursor-pointer"
              >
                <span>🎾</span>
              </button>
            </div>

            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {currentStory.views} visningar
            </span>
          </div>

          {/* Quick Reply Form */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder={`Svara ${currentStory.dogName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 rounded-full border border-white/30 bg-black/60 backdrop-blur-sm px-4 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
