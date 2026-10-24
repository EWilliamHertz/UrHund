"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  ShieldCheck,
  Award,
  Calendar,
  ExternalLink,
  Send,
  ZoomIn,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { Post, UserProfile, UserRole } from "@/data/mockSocial";

interface PostDetailModalProps {
  isOpen: boolean;
  post: Post | null;
  currentProfile: UserProfile;
  currentRole?: UserRole;
  onClose: () => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenImageLightbox: (images: string[], index: number) => void;
}

export function PostDetailModal({
  isOpen,
  post,
  currentProfile,
  onClose,
  onLikePost,
  onAddComment,
  onOpenImageLightbox,
}: PostDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [prevPostId, setPrevPostId] = useState(post?.id);
  const [commentText, setCommentText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Sync state when post changes without calling setState in an effect
  if (post?.id !== prevPostId) {
    setPrevPostId(post?.id);
    setActiveImageIndex(0);
    setCommentText("");
    setActionFeedback(null);
  }

  // Handle Escape key to close
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

  if (!isOpen || !post) return null;

  const postImages =
    post.images && post.images.length > 0
      ? post.images
      : post.image
      ? [post.image]
      : [];

  const hasPictures = postImages.length > 0;
  const isSponsored = post.postType === "SPONSORED_AD";

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText("");
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleActionClick = (message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const nextImage = () => {
    if (postImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === postImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (postImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? postImages.length - 1 : prev - 1));
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fade-in overflow-y-auto"
    >
      {/* Toast Notification inside modal */}
      {copiedLink && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-60 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950 shadow-2xl">
          Länk till inlägget har kopierats till urklipp!
        </div>
      )}

      {actionFeedback && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-60 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-zinc-950 shadow-2xl flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div
        className={`relative w-full rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden flex flex-col my-auto ${
          hasPictures
            ? "max-w-6xl md:h-[90vh] md:max-h-[820px] md:flex-row"
            : "max-w-2xl max-h-[90vh]"
        }`}
      >
        {/* ========================================================= */}
        {/* LEFT COLUMN: PICTURES (if pictures exist)                */}
        {/* ========================================================= */}
        {hasPictures && (
          <div className="relative flex-1 md:w-[58%] lg:w-[62%] bg-zinc-950/95 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800 overflow-hidden">
            {/* Top Toolbar in Left Column */}
            <div className="flex items-center justify-between p-3.5 z-10 bg-gradient-to-b from-black/60 to-transparent">
              <span className="rounded-full bg-zinc-900/90 border border-zinc-700/80 px-3 py-1 text-xs font-semibold text-zinc-300">
                Foto {activeImageIndex + 1} av {postImages.length}
              </span>

              <button
                onClick={() => onOpenImageLightbox(postImages, activeImageIndex)}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-900/90 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700/80 px-3 py-1 text-xs font-medium text-zinc-200 transition cursor-pointer"
                title="Öppna i stor helskärmsvisare"
              >
                <ZoomIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Förstora foto</span>
              </button>
            </div>

            {/* Main Center Image */}
            <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 min-h-[300px] md:min-h-0">
              {/* Previous Image Arrow */}
              {postImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-3 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-amber-500 hover:text-zinc-950 text-white border border-zinc-700 shadow-xl transition cursor-pointer backdrop-blur-sm"
                  title="Föregående foto"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Large Image with Click to Lightbox */}
              <div
                onClick={() => onOpenImageLightbox(postImages, activeImageIndex)}
                className="relative max-h-full max-w-full flex items-center justify-center cursor-pointer group"
                title="Klicka för att öppna i stor bildvisare"
              >
                <img
                  src={postImages[activeImageIndex]}
                  alt={`Foto ${activeImageIndex + 1}`}
                  className="max-h-[45vh] md:max-h-[64vh] w-auto max-w-full object-contain rounded-2xl shadow-xl group-hover:brightness-105 transition"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl flex items-center justify-center transition">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white font-medium flex items-center gap-1.5 shadow-lg transition">
                    <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                    <span>Klicka för helskärm</span>
                  </div>
                </div>
              </div>

              {/* Next Image Arrow */}
              {postImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-3 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-amber-500 hover:text-zinc-950 text-white border border-zinc-700 shadow-xl transition cursor-pointer backdrop-blur-sm"
                  title="Nästa foto"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Thumbnail Strip underneath big picture with arrows to each side */}
            {postImages.length > 1 && (
              <div className="p-3 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center justify-center gap-2">
                <button
                  onClick={prevImage}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Föregående"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2 overflow-x-auto py-0.5 px-1 scrollbar-none">
                  {postImages.map((img, idx) => {
                    const isSelected = idx === activeImageIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-400 ring-2 ring-amber-400/40 opacity-100 scale-105"
                            : "border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600 scale-95 hover:scale-100"
                        }`}
                        title={`Visa foto ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Miniatyr ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={nextImage}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Nästa"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* RIGHT COLUMN: TEXT, POST INFO, COMMENTS                   */}
        {/* ========================================================= */}
        <div
          className={`flex flex-col h-full bg-zinc-950 overflow-hidden ${
            hasPictures ? "flex-1 md:w-[42%] lg:w-[38%]" : "w-full"
          }`}
        >
          {/* Header: Author & Close Button */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800/80 shrink-0 bg-zinc-950/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className={`h-11 w-11 rounded-full object-cover border-2 ${
                    isSponsored
                      ? "border-amber-400"
                      : post.authorRole === "BREEDER"
                      ? "border-amber-500"
                      : post.authorRole === "SEEKING_DOG"
                      ? "border-cyan-500"
                      : "border-emerald-500"
                  }`}
                />
              ) : (
                <div
                  className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${
                    post.authorRole === "BREEDER"
                      ? "border-amber-500 bg-amber-500/20 text-amber-300"
                      : post.authorRole === "SEEKING_DOG"
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                      : "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {post.authorName ? post.authorName.slice(0, 2).toUpperCase() : "🐾"}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-bold text-white hover:underline cursor-pointer">
                    {post.authorName}
                  </span>
                  {post.authorBadge && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                        isSponsored
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                          : post.authorRole === "BREEDER"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                          : post.authorRole === "SEEKING_DOG"
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      {post.authorRole === "SEEKING_DOG" && post.authorBadge === "Hundägare"
                        ? "🐾 Vill skaffa hund"
                        : post.authorBadge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                  <span>{post.timestamp}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-500" />
                    {post.city}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Stäng (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Center: Content, Tags, Widgets, Comments */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 pr-3">
            {/* Post Content Text */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line font-normal">
                {post.content}
              </p>

              {/* Hashtags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-amber-400/90 hover:text-amber-300 cursor-pointer font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Special Box: Litter Announcement */}
            {post.postType === "LITTER_ANNOUNCEMENT" && post.extraData?.litterDetails && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    Dokumenterad Avelskombination (SKK)
                  </span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold">
                    {post.extraData.litterDetails.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block uppercase text-[10px]">Far (Sire):</span>
                    <span className="font-semibold text-white">
                      {post.extraData.litterDetails.sire}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[10px]">Mor (Dam):</span>
                    <span className="font-semibold text-white">
                      {post.extraData.litterDetails.dam}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[10px]">Leveransklara:</span>
                    <span className="font-semibold text-white flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-amber-400" />
                      {post.extraData.litterDetails.expectedDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[10px]">Hälsostatus:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {post.extraData.litterDetails.healthTests}
                    </span>
                  </div>
                </div>

                {/* Individual Puppies */}
                {post.extraData.litterDetails.puppyList && post.extraData.litterDetails.puppyList.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      Valpar i kullen (klicka för att granska):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {post.extraData.litterDetails.puppyList.map((pup, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const imgIdx = postImages.indexOf(pup.image);
                            if (imgIdx !== -1) {
                              setActiveImageIndex(imgIdx);
                            } else {
                              onOpenImageLightbox([pup.image], 0);
                            }
                          }}
                          className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-amber-500/50 transition p-1.5 flex items-center gap-2"
                        >
                          <img
                            src={pup.image}
                            alt={pup.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div className="overflow-hidden text-[10px]">
                            <div className="font-bold text-white truncate">{pup.name}</div>
                            <div className="text-zinc-400 truncate">{pup.gender} • {pup.color}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleActionClick("Intresseanmälan skickad till uppfödaren!")}
                  className="w-full rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition shadow-sm cursor-pointer"
                >
                  Skicka intresseanmälan till kenneln
                </button>
              </div>
            )}

            {/* Special Box: Playdate Request */}
            {post.postType === "PLAYDATE_REQUEST" && post.extraData?.playdateDetails && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    🎾 Lekträff & Hundkompis
                  </span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold border border-emerald-500/30">
                    {post.extraData.playdateDetails.energyLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-zinc-300 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">PLATS:</span>
                    <span className="font-semibold text-white">
                      {post.extraData.playdateDetails.parkArea}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">TID:</span>
                    <span className="font-semibold text-white">
                      {post.extraData.playdateDetails.preferredDate}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleActionClick("Du har svarat på lekträffen! Ägaren meddelas.")}
                  className="w-full rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition cursor-pointer"
                >
                  Jag hänger med! (Skicka svar)
                </button>
              </div>
            )}

            {/* Special Box: Dog Sitting */}
            {post.postType === "DOG_SITTING" && post.extraData?.dogSittingDetails && (
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    🏠 Hundvakt & Passning
                  </span>
                  <span className="rounded-full bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 text-[11px] font-semibold border border-indigo-500/30">
                    {post.extraData.dogSittingDetails.ratePerDaySEK} kr / dygn
                  </span>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Datum:</span>
                    <span className="text-white font-semibold">
                      {post.extraData.dogSittingDetails.dates}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Område:</span>
                    <span className="text-white font-semibold">
                      {post.extraData.dogSittingDetails.area}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleActionClick("Meddelande skickat till hundägaren!")}
                  className="w-full rounded-xl bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-400 transition cursor-pointer"
                >
                  Kontakta & Erbjuda Hundvakt
                </button>
              </div>
            )}

            {/* Special Box: Sponsored Ad */}
            {isSponsored && post.extraData?.sponsoredAd && (
              <div className="rounded-2xl border border-amber-500/40 bg-zinc-950/70 p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    {post.extraData.sponsoredAd.sponsor}
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-semibold border border-amber-500/30">
                    {post.extraData.sponsoredAd.badge}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs">
                    {post.extraData.sponsoredAd.productTitle}
                  </div>
                  <div className="text-xs font-black text-amber-400 shrink-0 ml-2">
                    {post.extraData.sponsoredAd.priceSEK}
                  </div>
                </div>
                <a
                  href={post.extraData.sponsoredAd.amazonAffiliateLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:from-amber-400 hover:to-orange-400 transition"
                >
                  <span>Köp på Amazon.se</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Stats Bar */}
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="text-amber-400">🐾</span>
                <span className="font-semibold text-white">{post.pawCount} tassar</span>
              </span>
              <span>{post.comments.length} kommentarer</span>
            </div>

            {/* Action Buttons Bar */}
            <div className="grid grid-cols-4 gap-1 border-t border-zinc-800/80 pt-2 text-xs">
              <button
                onClick={() => onLikePost(post.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-medium transition cursor-pointer ${
                  post.hasLiked
                    ? "bg-amber-500/15 text-amber-400 font-bold"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <span className="text-sm">🐾</span>
                <span>Tass {post.hasLiked ? "Gett" : ""}</span>
              </button>

              <button
                className="flex items-center justify-center gap-1.5 rounded-xl py-2 font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Kommentera</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 rounded-xl py-2 font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Dela</span>
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-medium transition cursor-pointer ${
                  isBookmarked
                    ? "text-amber-400"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
                <span className="hidden sm:inline">Spara</span>
              </button>
            </div>

            {/* Comments Stream */}
            <div className="border-t border-zinc-800/80 pt-3 space-y-3">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Kommentarer ({post.comments.length})
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {post.comments.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-3 text-center">
                    Inga kommentarer ännu. Bli först med att skriva!
                  </p>
                ) : (
                  post.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5 text-xs">
                      <img
                        src={c.authorAvatar}
                        alt={c.authorName}
                        className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 rounded-2xl bg-zinc-900/80 p-2.5 border border-zinc-800/90">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">{c.authorName}</span>
                          <span className="text-[10px] text-zinc-500">{c.timestamp}</span>
                        </div>
                        <p className="text-zinc-300 mt-1 leading-snug text-xs">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Fixed Comment Composer */}
          <div className="p-3 sm:p-4 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
              <input
                type="text"
                placeholder="Skriv en kommentar till inlägget..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="rounded-xl bg-amber-500 p-2 text-zinc-950 hover:bg-amber-400 transition disabled:opacity-40 cursor-pointer"
                title="Skicka kommentar"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
