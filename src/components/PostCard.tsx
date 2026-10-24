"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  ShieldCheck,
  Award,
  Calendar,
  ExternalLink,
  Send,
  MoreHorizontal,
  ShoppingCart,
  Star,
  Maximize2,
  ZoomIn,
  Edit3,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { Post, UserRole, UserProfile } from "@/data/mockSocial";
import { ImageLightboxModal } from "./ImageLightboxModal";

interface PostCardProps {
  post: Post;
  currentProfile: UserProfile;
  currentRole?: UserRole;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenPostDetail?: (post: Post) => void;
  onOpenImageLightbox?: (images: string[], index: number) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string, newContent: string) => void;
}

export function PostCard({
  post,
  currentProfile,
  currentRole,
  onLikePost,
  onAddComment,
  onOpenPostDetail,
  onOpenImageLightbox,
  onDeletePost,
  onEditPost,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Edit & Delete menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuCopyFeedback, setMenuCopyFeedback] = useState(false);

  const isAuthor =
    (post.authorId && currentProfile.id && post.authorId === currentProfile.id) ||
    (post.authorName && currentProfile.name && post.authorName.toLowerCase() === currentProfile.name.toLowerCase()) ||
    currentProfile.name === "Ernst-William Hertz";

  const postImages =
    post.images && post.images.length > 0
      ? post.images
      : post.image
      ? [post.image]
      : [];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText("");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenPhoto = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenImageLightbox) {
      onOpenImageLightbox(postImages, index);
    } else {
      setActiveLightboxIndex(index);
    }
  };

  const handlePostClick = () => {
    if (onOpenPostDetail) {
      onOpenPostDetail(post);
    }
  };

  const isSponsored = post.postType === "SPONSORED_AD";

  return (
    <>
      <article
        onClick={handlePostClick}
        className="group relative rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/60 p-3.5 sm:p-5 md:p-6 shadow-xl shadow-black/40 transition-all hover:border-zinc-700/80 hover:bg-zinc-900/80 cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
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
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-bold text-white hover:underline">
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

          <div className="flex items-center gap-1">
            {/* Open Detail View Affordance */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePostClick();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 text-[11px] font-medium border border-zinc-700/80 transition cursor-pointer"
              title="Öppna inlägget i stor vy"
            >
              <Maximize2 className="h-3 w-3" />
              <span className="hidden sm:inline">Öppna inlägg</span>
            </button>

            {/* Hamburger / 3-dots Options Menu */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
                title="Alternativ för inlägg"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-2xl border border-zinc-800 bg-zinc-900/98 backdrop-blur-xl p-1.5 shadow-2xl z-30 animate-fade-in text-xs">
                  {isAuthor && onEditPost && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsEditing(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-200 hover:text-white hover:bg-zinc-800 transition text-left cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                      <span>Redigera inlägg</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const url = `${window.location.origin}/?post=${post.id}`;
                        await navigator.clipboard.writeText(url);
                        setMenuCopyFeedback(true);
                        setTimeout(() => {
                          setMenuCopyFeedback(false);
                          setIsMenuOpen(false);
                        }, 1200);
                      } catch {}
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-200 hover:text-white hover:bg-zinc-800 transition text-left cursor-pointer"
                  >
                    {menuCopyFeedback ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Länk kopierad!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Kopiera länk</span>
                      </>
                    )}
                  </button>

                  {isAuthor && onDeletePost && (
                    <>
                      <div className="my-1 border-t border-zinc-800" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        <span>Ta bort inlägg</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Text or Inline Edit Mode */}
        {isEditing ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-amber-500/50 bg-zinc-950 p-3 text-xs md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Skriv inläggets nya text..."
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditContent(post.content);
                  setIsEditing(false);
                }}
                disabled={isSavingEdit}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editContent.trim()) return;
                  setIsSavingEdit(true);
                  if (onEditPost) {
                    await onEditPost(post.id, editContent);
                  }
                  setIsSavingEdit(false);
                  setIsEditing(false);
                }}
                disabled={isSavingEdit || !editContent.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow cursor-pointer"
              >
                {isSavingEdit ? "Sparar..." : "Spara ändringar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs md:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            {/* Hashtags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-amber-400/90 hover:text-amber-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Special Box: Litter Announcement */}
        {post.postType === "LITTER_ANNOUNCEMENT" && post.extraData?.litterDetails && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                Dokumenterad Avelskombination (SKK)
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold">
                {post.extraData.litterDetails.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Far (Sire):</span>
                <span className="font-semibold text-white">
                  {post.extraData.litterDetails.sire}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Mor (Dam):</span>
                <span className="font-semibold text-white">
                  {post.extraData.litterDetails.dam}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Beräknad nedkomst:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-amber-400" />
                  {post.extraData.litterDetails.expectedDate}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Hälsostatus:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {post.extraData.litterDetails.healthTests}
                </span>
              </div>
            </div>

            {/* Individual Puppies Showcase */}
            {post.extraData.litterDetails.puppyList && post.extraData.litterDetails.puppyList.length > 0 && (
              <div className="pt-2 border-t border-amber-500/20 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  Valpar i kullen (klicka på foto för att förstora):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {post.extraData.litterDetails.puppyList.map((pup, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        const imgIndex = postImages.indexOf(pup.image);
                        if (imgIndex !== -1) {
                          handleOpenPhoto(imgIndex, e);
                        } else {
                          handleOpenPhoto(0, e);
                        }
                      }}
                      className="group/pup relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/80 cursor-pointer hover:border-amber-500/50 transition shadow-sm"
                    >
                      <div className="aspect-square w-full overflow-hidden relative">
                        <img
                          src={pup.image}
                          alt={pup.name}
                          className="h-full w-full object-cover group-hover/pup:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/pup:bg-black/30 flex items-center justify-center transition">
                          <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover/pup:opacity-100 transition" />
                        </div>
                      </div>
                      <div className="p-1.5 bg-zinc-900/90 text-[10px]">
                        <div className="font-bold text-white truncate">{pup.name}</div>
                        <div className="flex items-center justify-between text-zinc-400 mt-0.5">
                          <span>{pup.gender} • {pup.color}</span>
                          {pup.status && (
                            <span className={`text-[9px] font-semibold px-1 rounded ${
                              pup.status === "Ledig" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                            }`}>
                              {pup.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400">
                Tillgängliga valpar: ~{post.extraData.litterDetails.availablePuppies} st
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick();
                }}
                className="rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition shadow-sm cursor-pointer"
              >
                Skicka intresseanmälan till kenneln
              </button>
            </div>
          </div>
        )}

        {/* Special Box: Playdate Request */}
        {post.postType === "PLAYDATE_REQUEST" && post.extraData?.playdateDetails && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                🎾 Lekträff & Hundkompis
              </span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[11px] font-semibold border border-emerald-500/30">
                {post.extraData.playdateDetails.energyLevel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
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
              onClick={(e) => {
                e.stopPropagation();
                handlePostClick();
              }}
              className="w-full rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition cursor-pointer"
            >
              Jag hänger med! (Skicka meddelande)
            </button>
          </div>
        )}

        {/* Special Box: Dog Sitting */}
        {post.postType === "DOG_SITTING" && post.extraData?.dogSittingDetails && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                🏠 Hundvakt & Passning
              </span>
              <span className="rounded-full bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 text-[11px] font-semibold border border-indigo-500/30">
                {post.extraData.dogSittingDetails.ratePerDaySEK} kr / dygn
              </span>
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-1">
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
              <div className="flex justify-between">
                <span className="text-zinc-400">Krav/Önskemål:</span>
                <span className="text-zinc-200">
                  {post.extraData.dogSittingDetails.requirements}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePostClick();
              }}
              className="w-full rounded-xl bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-400 transition cursor-pointer"
            >
              Kontakta & Erbjuda Hundvakt
            </button>
          </div>
        )}

        {/* Special Box: Sponsored Ad Product */}
        {isSponsored && post.extraData?.sponsoredAd && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 rounded-2xl border border-amber-500/40 bg-zinc-950/70 p-4 space-y-3 text-xs"
          >
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
              <div>
                <div className="font-bold text-white text-sm">
                  {post.extraData.sponsoredAd.productTitle}
                </div>
                <div className="flex items-center gap-2 mt-1 text-zinc-400">
                  <span className="flex items-center text-amber-400 font-bold">
                    <Star className="h-3 w-3 fill-amber-400 mr-1" />
                    {post.extraData.sponsoredAd.rating}
                  </span>
                  <span>({post.extraData.sponsoredAd.reviewsCount} omdömen)</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">
                    {post.extraData.sponsoredAd.dealText}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-amber-400">
                  {post.extraData.sponsoredAd.priceSEK}
                </div>
              </div>
            </div>

            <a
              href={post.extraData.sponsoredAd.amazonAffiliateLink}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-bold text-zinc-950 hover:from-amber-400 hover:to-orange-400 transition"
            >
              <span>Köp på Amazon.se med Prime</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Post Photos (Single or Multi-image Facebook style Grid) */}
        {postImages.length > 0 && (
          <div className="mt-4">
            {/* 1 Photo */}
            {postImages.length === 1 && (
              <div
                onClick={(e) => handleOpenPhoto(0, e)}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[16/10] sm:aspect-[2/1] relative cursor-pointer group"
                title="Klicka för att förstora fotot"
              >
                <img
                  src={postImages[0]}
                  alt="Inläggsbild"
                  className="h-full w-full object-cover group-hover:scale-[1.01] transition duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition">
                    <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                    <span>Klicka för att förstora</span>
                  </span>
                </div>
              </div>
            )}

            {/* 2 Photos */}
            {postImages.length === 2 && (
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden border border-zinc-800 aspect-[16/10]">
                {postImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handleOpenPhoto(idx, e)}
                    className="relative h-full w-full bg-zinc-950 overflow-hidden cursor-pointer group"
                    title={`Klicka för att förstora foto ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                      <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3 Photos */}
            {postImages.length === 3 && (
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden border border-zinc-800 aspect-[16/10]">
                <div
                  onClick={(e) => handleOpenPhoto(0, e)}
                  className="col-span-2 relative h-full w-full bg-zinc-950 overflow-hidden cursor-pointer group"
                  title="Klicka för att förstora foto 1"
                >
                  <img
                    src={postImages[0]}
                    alt="Foto 1"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                    <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>
                <div className="grid grid-rows-2 gap-1.5 h-full">
                  {postImages.slice(1, 3).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => handleOpenPhoto(idx + 1, e)}
                      className="relative h-full w-full bg-zinc-950 overflow-hidden cursor-pointer group"
                      title={`Klicka för att förstora foto ${idx + 2}`}
                    >
                      <img
                        src={img}
                        alt={`Foto ${idx + 2}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                        <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4 Photos */}
            {postImages.length === 4 && (
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden border border-zinc-800 aspect-square sm:aspect-[16/10]">
                {postImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handleOpenPhoto(idx, e)}
                    className="relative h-full w-full bg-zinc-950 overflow-hidden cursor-pointer group"
                    title={`Klicka för att förstora foto ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                      <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5+ Photos */}
            {postImages.length >= 5 && (
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden border border-zinc-800 aspect-square sm:aspect-[16/10]">
                {postImages.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handleOpenPhoto(idx, e)}
                    className="relative h-full w-full bg-zinc-950 overflow-hidden cursor-pointer group"
                    title={`Klicka för att förstora foto ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                      <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                ))}
                <div
                  onClick={(e) => handleOpenPhoto(3, e)}
                  className="relative h-full w-full bg-zinc-950 overflow-hidden cursor-pointer group"
                  title="Klicka för att se alla foton"
                >
                  <img
                    src={postImages[3]}
                    alt="Foto 4"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-xl group-hover:bg-black/70 transition">
                    +{postImages.length - 3}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Counter Bar */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="text-amber-400">🐾</span>
              <span className="font-semibold text-white">{post.pawCount} tassar</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="hover:underline cursor-pointer"
            >
              {post.comments.length} kommentarer
            </button>
          </div>
        </div>

        {/* Facebook-style Action Buttons */}
        <div className="mt-2 grid grid-cols-4 gap-1 border-t border-zinc-800/80 pt-2 text-[11px] sm:text-xs">
          {/* Like / Paw button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLikePost(post.id);
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 sm:py-2 font-medium transition cursor-pointer ${
              post.hasLiked
                ? "bg-amber-500/15 text-amber-400 font-bold"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            <span className="text-xs sm:text-sm">🐾</span>
            <span className="truncate">{post.hasLiked ? "Gett" : "Tass"}</span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 sm:py-2 font-medium transition cursor-pointer ${
              showComments
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Kommentera</span>
            <span className="sm:hidden">Svara</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1 rounded-xl py-1.5 sm:py-2 font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="truncate">{copiedLink ? "Kopierad!" : "Dela"}</span>
          </button>

          {/* Bookmark button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 sm:py-2 font-medium transition cursor-pointer ${
              isBookmarked
                ? "text-amber-400 font-bold"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
            <span className="truncate">{isBookmarked ? "Sparad" : "Spara"}</span>
          </button>
        </div>

        {/* Expandable Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mt-4 space-y-3 border-t border-zinc-800/80 pt-3"
            >
              {/* Existing comments */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {post.comments.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-1 text-center">
                    Bli först med att lämna en kommentar!
                  </p>
                ) : (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 rounded-2xl bg-zinc-950/70 p-2.5 border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            {comment.authorName}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-zinc-300 mt-1 leading-snug">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment input form */}
              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                />
                <input
                  type="text"
                  placeholder="Skriv en kommentar till inlägget..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="rounded-xl bg-amber-500 p-1.5 text-zinc-950 hover:bg-amber-400 transition disabled:opacity-40 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Button to view all in modal */}
              {onOpenPostDetail && (
                <div className="pt-2 text-center">
                  <button
                    onClick={handlePostClick}
                    className="text-xs text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    Öppna hela inlägget med bild och kommentarer i modal →
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </article>

      {/* Internal Lightbox fallback if not handled by parent */}
      <ImageLightboxModal
        isOpen={activeLightboxIndex !== null}
        images={postImages}
        initialIndex={activeLightboxIndex ?? 0}
        onClose={() => setActiveLightboxIndex(null)}
        title={post.authorName}
        subtitle={`${post.timestamp} • ${post.city}`}
        onOpenPostDetail={
          onOpenPostDetail
            ? () => {
                setActiveLightboxIndex(null);
                onOpenPostDetail(post);
              }
            : undefined
        }
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Ta bort inlägg?</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Åtgärden går inte att ångra. Inlägget raderas permanent från flödet och databasen.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeleting(true);
                  if (onDeletePost) {
                    await onDeletePost(post.id);
                  }
                  setIsDeleting(false);
                  setShowDeleteConfirm(false);
                }}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/20"
              >
                {isDeleting ? "Tar bort..." : "Ja, radera inlägg"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
