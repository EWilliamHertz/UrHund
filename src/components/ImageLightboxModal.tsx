"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react";

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onOpenPostDetail?: () => void;
}

export function ImageLightboxModal({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
  title,
  subtitle,
  onOpenPostDetail,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Sync index when initialIndex changes using React's recommended state adjustment pattern
  if (initialIndex !== prevInitialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
    setIsZoomed(false);
  }

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
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

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeEl = thumbnailContainerRef.current.querySelector(
        `[data-thumb-index="${currentIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  if (!isOpen || images.length === 0) return null;

  const scrollThumbnailsLeft = () => {
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const scrollThumbnailsRight = () => {
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  const handleShare = () => {
    const currentImg = images[currentIndex];
    navigator.clipboard?.writeText(currentImg || window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl animate-fade-in p-3 sm:p-6 select-none"
    >
      {/* Top Bar: Title, Count, and Action Controls */}
      <div className="flex items-center justify-between text-white z-20 pb-2">
        <div className="flex items-center gap-3">
          {title && (
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">{title}</h4>
              {subtitle && <p className="text-[11px] text-zinc-400">{subtitle}</p>}
            </div>
          )}
          {images.length > 1 && (
            <span className="rounded-full bg-zinc-900/90 border border-zinc-700/80 px-3 py-1 text-xs font-semibold text-zinc-300">
              Foto {currentIndex + 1} av {images.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenPostDetail && (
            <button
              onClick={onOpenPostDetail}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-white transition cursor-pointer"
              title="Visa tillhörande inlägg och kommentarer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Öppna inlägg</span>
            </button>
          )}

          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition cursor-pointer"
            title={isZoomed ? "Återställ zoom" : "Zooma in"}
          >
            {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </button>

          <a
            href={images[currentIndex]}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Öppna bild i ny flik / ladda ner"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Kopiera bildlänk"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800/90 hover:bg-rose-500/80 border border-zinc-700 text-zinc-200 hover:text-white transition cursor-pointer ml-1"
            title="Stäng bildvisaren (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {copiedLink && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950 shadow-xl animate-bounce">
          Bildlänk kopierad till urklipp!
        </div>
      )}

      {/* Main Large Image Display Area with Left & Right Arrows */}
      <div className="relative flex-1 flex items-center justify-center my-auto min-h-0 overflow-hidden">
        {/* Left Arrow on Large Image */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-4 z-20 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-zinc-900/85 hover:bg-amber-500 hover:text-zinc-950 text-white border border-zinc-700/80 shadow-2xl transition-all scale-100 hover:scale-105 cursor-pointer backdrop-blur-md"
            title="Föregående bild (Vänsterpiltangent)"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}

        {/* The Big Image */}
        <div
          onClick={() => setIsZoomed(!isZoomed)}
          className={`relative max-h-full max-w-full flex items-center justify-center transition-transform duration-300 ${
            isZoomed ? "cursor-zoom-out scale-125 overflow-auto" : "cursor-zoom-in"
          }`}
        >
          <img
            src={images[currentIndex]}
            alt={`Foto ${currentIndex + 1}`}
            className="max-h-[68vh] md:max-h-[74vh] max-w-[92vw] md:max-w-[85vw] w-auto h-auto object-contain rounded-2xl shadow-2xl transition-all duration-200"
          />
        </div>

        {/* Right Arrow on Large Image */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-4 z-20 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-zinc-900/85 hover:bg-amber-500 hover:text-zinc-950 text-white border border-zinc-700/80 shadow-2xl transition-all scale-100 hover:scale-105 cursor-pointer backdrop-blur-md"
            title="Nästa bild (Högerpiltangent)"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        )}
      </div>

      {/* Underneath: Thumbnails bar with arrows to each side (if multiple images exist) */}
      {images.length > 1 && (
        <div className="z-20 pt-3 pb-1 flex items-center justify-center gap-2 max-w-3xl mx-auto w-full">
          {/* Left Arrow on Thumbnail Row */}
          <button
            onClick={scrollThumbnailsLeft}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Bläddra miniatyrer åt vänster"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Thumbnail Strip */}
          <div
            ref={thumbnailContainerRef}
            className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((img, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  data-thumb-index={idx}
                  onClick={() => {
                    setIsZoomed(false);
                    setCurrentIndex(idx);
                  }}
                  className={`relative shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-400/50 scale-105 opacity-100 shadow-lg shadow-amber-500/20"
                      : "border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600 scale-95 hover:scale-100"
                  }`}
                  title={`Visa foto ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Miniatyr ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-400/10 pointer-events-none" />
                  )}
                  <span className="absolute bottom-1 right-1 rounded-md bg-black/70 px-1 text-[9px] font-bold text-white">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow on Thumbnail Row */}
          <button
            onClick={scrollThumbnailsRight}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Bläddra miniatyrer åt höger"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
