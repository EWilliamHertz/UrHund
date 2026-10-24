"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Award,
  Heart,
  Scale,
  Wallet,
  Clock,
  Compass,
  HeartPulse,
  Globe2,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Info,
  ArrowUpRight,
  Filter,
  PlusCircle,
  Share2,
  Loader2,
  Search,
  ChevronDown,
  X,
  ArrowUpDown,
  Smartphone,
  Dog,
  Phone,
} from "lucide-react";
import { Breed, Kennel } from "@/data/breeds";
import {
  UserRole,
  UserProfile,
  DEFAULT_PROFILES,
  Post,
  DogMateProfile,
  DogSitterProfile,
  generateRandomAIPost,
} from "@/data/mockSocial";
import { RoleSelectorModal } from "@/components/RoleSelectorModal";
import { AuthModal } from "@/components/AuthModal";
import { ClaimKennelModal } from "@/components/ClaimKennelModal";
import { KennelProfileModal } from "@/components/KennelProfileModal";
import { FacebookNavbar } from "@/components/FacebookNavbar";
import { PostComposer } from "@/components/PostComposer";
import { PostCard } from "@/components/PostCard";
import { DogMatesView } from "@/components/DogMatesView";
import { DogSittingView } from "@/components/DogSittingView";
import { RightSidebar } from "@/components/RightSidebar";
import { CanineStoriesBar } from "@/components/CanineStoriesBar";
import { StoryViewerModal, CanineStory } from "@/components/StoryViewerModal";
import { StoryCreatorModal } from "@/components/StoryCreatorModal";
import { PostDetailModal } from "@/components/PostDetailModal";
import { ImageLightboxModal } from "@/components/ImageLightboxModal";
import { AccountSettingsModal } from "@/components/AccountSettingsModal";
import { BreedsView } from "@/components/BreedsView";
import { KennelsView } from "@/components/KennelsView";

export default function AsiaticDogsPlatform() {
  // Role & Profile State
  const [currentRole, setCurrentRole] = useState<UserRole>("DOG_OWNER");
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILES.DOG_OWNER);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(true); // Starts with role selection modal/cards!
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Registration & login modal comes after
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // Full Account & Profile Settings Modal
  const [hasChosenInitialRole, setHasChosenInitialRole] = useState(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"FEED" | "MATES" | "SITTING" | "BREEDS" | "KENNELS">("FEED");

  // Database State from PostgreSQL
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [dogMates, setDogMates] = useState<DogMateProfile[]>([]);
  const [dogSitters, setDogSitters] = useState<DogSitterProfile[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Detail Modal & Lightbox States
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    index: number;
    title?: string;
    subtitle?: string;
    post?: Post | null;
  }>({
    isOpen: false,
    images: [],
    index: 0,
  });

  // Canine Stories State - starts clean with real stories
  const [stories, setStories] = useState<CanineStory[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

  // Feed Filter, Search & Sort
  const [feedFilter, setFeedFilter] = useState<"ALL" | "LITTER" | "PLAYDATE" | "SITTING" | "TIPS" | "ADS">("ALL");
  const [feedSearchQuery, setFeedSearchQuery] = useState("");
  const [feedSort, setFeedSort] = useState<"NEWEST" | "LIKES" | "COMMENTS">("NEWEST");
  const [selectedBreedId, setSelectedBreedId] = useState<string>("");
  const [claimingKennel, setClaimingKennel] = useState<Kennel | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedKennelForProfile, setSelectedKennelForProfile] = useState<Kennel | null>(null);
  const [isKennelProfileOpen, setIsKennelProfileOpen] = useState(false);
  const [isMobilePreviewMode, setIsMobilePreviewMode] = useState(false);

  const handleKennelOptOut = (kennelId: string) => {
    setKennels((prev) => prev.filter((k) => k.id !== kennelId));
  };

  useEffect(() => {
    let isMounted = true;

    // Check if user requested mobile view via URL or stored preference
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("view") === "mobile" || localStorage.getItem("urhund_mobile_preview") === "true") {
        setTimeout(() => {
          if (isMounted) setIsMobilePreviewMode(true);
        }, 0);
      }
    }

    async function loadDatabaseData() {
      try {
        const res = await fetch("/api/data");
        if (res.ok && isMounted) {
          const data = await res.json();
          setBreeds(data.breeds || []);
          setKennels(data.kennels || []);
          setPosts(data.posts || []);
          setDogMates(data.dogMates || []);
          setDogSitters(data.dogSitters || []);
          if (data.breeds && data.breeds.length > 0) {
            setSelectedBreedId((prev) => prev || data.breeds[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load database data:", err);
      } finally {
        if (isMounted) {
          setIsLoadingDb(false);
        }
      }
    }

    loadDatabaseData();

    try {
      const savedUser = localStorage.getItem("urhund_active_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setTimeout(() => {
          if (isMounted) {
            setProfile(parsed);
            setCurrentRole(parsed.role || "SEEKING_DOG");
            setHasChosenInitialRole(true);
            setIsRoleModalOpen(false);
          }
        }, 0);

        // Fetch fresh profile from PostgreSQL to ensure latest name, role & settings
        const queryParam = parsed.id && !parsed.id.startsWith("guest-")
          ? `id=${parsed.id}`
          : `email=${encodeURIComponent(parsed.email || "ernst@hatake.eu")}`;
        fetch(`/api/auth/profile?${queryParam}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.profile && isMounted) {
              setProfile(data.profile);
              setCurrentRole(data.profile.role || "SEEKING_DOG");
              try {
                localStorage.setItem("urhund_active_user", JSON.stringify(data.profile));
              } catch {}
            }
          })
          .catch(() => {});
      } else {
        // Fallback: automatically load Ernst-William Hertz from PostgreSQL
        fetch("/api/auth/profile?email=ernst@hatake.eu")
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.profile && isMounted) {
              setProfile(data.profile);
              setCurrentRole(data.profile.role || "SEEKING_DOG");
              setHasChosenInitialRole(true);
              setIsRoleModalOpen(false);
              try {
                localStorage.setItem("urhund_active_user", JSON.stringify(data.profile));
              } catch {}
            }
          })
          .catch(() => {});
      }
    } catch {}

    return () => {
      isMounted = false;
    };
  }, []);



  const handleKennelClaimSuccess = (claimedKennelId: string, claimantName: string) => {
    setKennels((prev) =>
      prev.map((k) =>
        k.id === claimedKennelId ? { ...k, claimed: true, claimedBy: claimantName } : k
      )
    );
  };

  // Switch between roles without losing user details
  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        role: newRole,
        id: prev.id && !prev.id.startsWith("guest-") ? prev.id : "user-1792774875281",
        email: prev.email || "ernst@hatake.eu",
        name: prev.name && prev.name !== "Hundägare" && prev.name !== "Vill skaffa hund" ? prev.name : "Ernst-William Hertz",
      };

      try {
        localStorage.setItem("urhund_active_user", JSON.stringify(updated));
        fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }).catch(() => {});
      } catch {}

      return updated;
    });
  };

  // Delete post handler with live DB deletion
  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await fetch(`/api/posts?id=${encodeURIComponent(postId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  // Edit post handler with live DB persistence
  const handleEditPost = async (postId: string, newContent: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content: newContent } : p))
    );
    try {
      await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, content: newContent }),
      });
    } catch (err) {
      console.error("Failed to edit post:", err);
    }
  };

  // Entrance Question Handler: Opens Registration & Login Modal immediately after!
  const handleSelectRoleFromModal = (role: UserRole) => {
    handleSwitchRole(role);
    setIsRoleModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setCurrentRole(newProfile.role);
    setHasChosenInitialRole(true);
    setIsAuthModalOpen(false);
    try {
      localStorage.setItem("urhund_active_user", JSON.stringify(newProfile));
    } catch {}
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("urhund_active_user");
    } catch {}
    setProfile(DEFAULT_PROFILES.DOG_OWNER);
    setCurrentRole("DOG_OWNER");
    setHasChosenInitialRole(false);
    setIsRoleModalOpen(true);
  };

  // Add post to PostgreSQL
  const handleAddPost = async (newPost: Post) => {
    // Optimistic update
    setPosts([newPost, ...posts]);

    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
    } catch (err) {
      console.error("Failed to persist post to PostgreSQL:", err);
    }
  };

  // Open Image Lightbox
  const handleOpenImageLightbox = (images: string[], index: number, post?: Post | null) => {
    setLightboxState({
      isOpen: true,
      images,
      index,
      title: post ? post.authorName : undefined,
      subtitle: post ? `${post.timestamp} • ${post.city}` : undefined,
      post: post || null,
    });
  };

  // Like / Paw interaction with PostgreSQL
  const handleLikePost = async (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    const increment = !targetPost?.hasLiked;

    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const hasLiked = !post.hasLiked;
          return {
            ...post,
            hasLiked,
            pawCount: hasLiked ? post.pawCount + 1 : Math.max(0, post.pawCount - 1),
          };
        }
        return post;
      })
    );

    setSelectedPostForDetail((prev) => {
      if (!prev || prev.id !== postId) return prev;
      const hasLiked = !prev.hasLiked;
      return {
        ...prev,
        hasLiked,
        pawCount: hasLiked ? prev.pawCount + 1 : Math.max(0, prev.pawCount - 1),
      };
    });

    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, increment }),
      });
    } catch (err) {
      console.error("Failed to update like in PostgreSQL:", err);
    }
  };

  // Add comment interaction with PostgreSQL
  const handleAddComment = async (postId: string, text: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: profile.name,
      authorAvatar: profile.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      authorRole: currentRole,
      text,
      timestamp: "Just nu",
      likes: 0,
    };

    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );

    setSelectedPostForDetail((prev) => {
      if (!prev || prev.id !== postId) return prev;
      return {
        ...prev,
        comments: [...prev.comments, newComment],
      };
    });

    try {
      await fetch("/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorName: profile.name,
          authorAvatar: profile.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
          authorRole: currentRole,
          text,
        }),
      });
    } catch (err) {
      console.error("Failed to save comment to PostgreSQL:", err);
    }
  };

  // Autonomous AI Robot Swarm Generator Trigger with PostgreSQL persistence
  const handleGenerateAIPost = async () => {
    const allDogs = (profile.dogs && profile.dogs.length > 0) ? profile.dogs : (profile.dog ? [profile.dog] : []);
    const primaryDog = allDogs[0];
    const dogName = primaryDog?.name || (profile.name !== "Hundägare" ? profile.name : "Kompisen");
    const breedName = primaryDog?.breedName || "Asiatisk Urhund";
    const newAIPost = generateRandomAIPost(dogName, breedName);

    // Optimistic update
    setPosts([newAIPost, ...posts]);
    setActiveTab("FEED");

    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAIPost),
      });
    } catch (err) {
      console.error("Failed to save AI post to PostgreSQL:", err);
    }
  };

  // Filtered and Sorted Posts
  const filteredPosts = posts
    .filter((post) => {
      if (feedFilter === "LITTER" && post.postType !== "LITTER_ANNOUNCEMENT") return false;
      if (feedFilter === "PLAYDATE" && post.postType !== "PLAYDATE_REQUEST") return false;
      if (feedFilter === "SITTING" && post.postType !== "DOG_SITTING") return false;
      if (feedFilter === "TIPS" && post.postType !== "AI_TIP" && !post.tags.some((t) => /tip|guide|råd|träning|hälsa|skötsel/i.test(t))) return false;
      if (feedFilter === "ADS" && post.postType !== "SPONSORED_AD") return false;

      if (feedSearchQuery.trim()) {
        const q = feedSearchQuery.toLowerCase();
        const matchesContent = post.content.toLowerCase().includes(q);
        const matchesAuthor = post.authorName.toLowerCase().includes(q);
        const matchesCity = post.city.toLowerCase().includes(q);
        const matchesTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesContent && !matchesAuthor && !matchesCity && !matchesTags) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (feedSort === "LIKES") {
        return (b.pawCount || 0) - (a.pawCount || 0);
      }
      if (feedSort === "COMMENTS") {
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      }
      return 0; // Default order
    });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Role Selection Initial Modal (Question 1) */}
      <RoleSelectorModal
        isOpen={isRoleModalOpen}
        onSelectRole={handleSelectRoleFromModal}
        onClose={() => {
          setIsRoleModalOpen(false);
          setHasChosenInitialRole(true);
        }}
        canDismiss={true}
      />

      {/* Registration and Login Modal (comes right after entrance modal question) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        role={currentRole}
        onSuccess={handleAuthSuccess}
        onClose={() => {
          setIsAuthModalOpen(false);
          setHasChosenInitialRole(true);
        }}
        onSwitchRole={handleSwitchRole}
      />

      {/* Claim Kennel Ownership Modal */}
      <ClaimKennelModal
        isOpen={isClaimModalOpen}
        kennel={claimingKennel}
        onClose={() => {
          setIsClaimModalOpen(false);
          setClaimingKennel(null);
        }}
        onClaimSuccess={handleKennelClaimSuccess}
      />

      {/* Dedicated Kennel Profile Page Modal */}
      <KennelProfileModal
        isOpen={isKennelProfileOpen}
        kennel={selectedKennelForProfile}
        onClose={() => {
          setIsKennelProfileOpen(false);
          setSelectedKennelForProfile(null);
        }}
        onClaim={(k) => {
          setClaimingKennel(k);
          setIsClaimModalOpen(true);
        }}
        onOptOut={(kId) => handleKennelOptOut(kId)}
      />

      {/* Post Detail Modal (Click post to open modal with picture on left & text on right) */}
      <PostDetailModal
        isOpen={!!selectedPostForDetail}
        post={selectedPostForDetail}
        currentProfile={profile}
        currentRole={currentRole}
        onClose={() => setSelectedPostForDetail(null)}
        onLikePost={handleLikePost}
        onAddComment={handleAddComment}
        onOpenImageLightbox={(images, idx) => handleOpenImageLightbox(images, idx, selectedPostForDetail)}
      />

      {/* Fullscreen Photo Lightbox Modal (Selected photo big, other photos underneath with arrows to each side) */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        initialIndex={lightboxState.index}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        title={lightboxState.title}
        subtitle={lightboxState.subtitle}
        onOpenPostDetail={
          lightboxState.post
            ? () => {
                const p = lightboxState.post!;
                setLightboxState((prev) => ({ ...prev, isOpen: false }));
                setSelectedPostForDetail(p);
              }
            : undefined
        }
      />

      {/* Canine 24h Story Viewer Modal */}
      <StoryViewerModal
        isOpen={activeStoryIndex !== null}
        stories={stories}
        initialIndex={activeStoryIndex ?? 0}
        onClose={() => setActiveStoryIndex(null)}
      />

      {/* Canine 24h Story Creator Modal */}
      <StoryCreatorModal
        isOpen={isCreateStoryOpen}
        profile={profile}
        currentRole={currentRole}
        onClose={() => setIsCreateStoryOpen(false)}
        onAddStory={(newStory) => setStories([newStory, ...stories])}
      />

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isSettingsModalOpen}
        profile={profile}
        currentRole={currentRole}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          try {
            localStorage.setItem("urhund_active_user", JSON.stringify(updated));
          } catch {}
        }}
        onRoleChange={(newRole) => {
          setCurrentRole(newRole);
        }}
      />

      {/* Main View Shell with Optional Mobile Device Simulator */}
      <div
        className={
          isMobilePreviewMode
            ? "py-4 md:py-8 px-0 md:px-4 flex flex-col items-center justify-start min-h-screen bg-zinc-950"
            : ""
        }
      >
        {isMobilePreviewMode && (
          <div className="hidden md:flex w-full max-w-[400px] mb-3 items-center justify-between text-xs text-zinc-400 px-2">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400">
              <Smartphone className="h-3.5 w-3.5" />
              iPhone 15 Pro Mobilvy (390 px)
            </span>
            <button
              onClick={() => {
                setIsMobilePreviewMode(false);
                try {
                  localStorage.setItem("urhund_mobile_preview", "false");
                } catch {}
              }}
              className="text-zinc-400 hover:text-white underline text-[11px] cursor-pointer"
            >
              Återgå till skrivbordsvy
            </button>
          </div>
        )}

        <div
          className={
            isMobilePreviewMode
              ? "relative w-full md:max-w-[390px] min-h-screen md:min-h-0 md:h-[844px] md:rounded-[50px] md:border-[10px] md:border-zinc-800 bg-zinc-950 md:shadow-2xl md:shadow-black overflow-y-auto scrollbar-none md:ring-1 md:ring-zinc-700/60 flex flex-col"
              : ""
          }
        >
          {isMobilePreviewMode && (
            <div className="hidden md:flex sticky top-0 left-0 right-0 z-50 h-7 bg-zinc-950 items-center justify-center shrink-0">
              <div className="h-4 w-28 bg-black rounded-full flex items-center justify-center border border-zinc-800/80">
                <div className="h-2 w-2 rounded-full bg-zinc-900 mr-2" />
                <div className="h-2 w-2 rounded-full bg-cyan-950" />
              </div>
            </div>
          )}

          {/* Facebook-style Navbar connected to live database */}
          <FacebookNavbar
            currentRole={currentRole}
            profile={profile}
            breeds={breeds}
            kennels={kennels}
            dogMates={dogMates}
            dogSitters={dogSitters}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onLogout={handleLogout}
            isMobileMode={isMobilePreviewMode}
          />

          {/* Main Body Grid */}
          <main className="mx-auto max-w-7xl px-2.5 sm:px-4 py-3 sm:py-8 pb-24 md:pb-8">
        {isLoadingDb ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-8 w-8 text-amber-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-white">Laddar gemenskapen...</p>
            <p className="text-xs text-zinc-500 mt-1">Hämtar kennlar, raser och inlägg</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${isMobilePreviewMode ? "" : "lg:grid-cols-12"} gap-5 lg:gap-8`}>
            {/* Main Content Area (8 Cols for Feed, 12 Cols for Directory Views) */}
            <div className={`${isMobilePreviewMode ? "w-full" : (activeTab === "KENNELS" || activeTab === "BREEDS") ? "lg:col-span-12" : "lg:col-span-8"} space-y-4 sm:space-y-6`}>
              {/* VIEW 1: FEED (Facebook for Dog Owners & Kennels) */}
              {activeTab === "FEED" && (
                <div className="space-y-6">
                  {/* Canine 24h Stories Bar */}
                  <CanineStoriesBar
                    stories={stories}
                    currentProfile={profile}
                    onOpenCreateStory={() => setIsCreateStoryOpen(true)}
                    onSelectStory={(index) => setActiveStoryIndex(index)}
                  />

                  {/* Post Composer */}
                  <PostComposer
                    currentRole={currentRole}
                    profile={profile}
                    onAddPost={handleAddPost}
                  />

                  {/* Feed Search, Filter & Sort Bar */}
                  <div className="space-y-3">
                    {/* Search and Sort Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      {/* Search in Feed */}
                      <div className="relative flex-1">
                        <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Sök bland inlägg (ras, stad, text eller författare)..."
                          value={feedSearchQuery}
                          onChange={(e) => setFeedSearchQuery(e.target.value)}
                          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition shadow-sm"
                        />
                        {feedSearchQuery && (
                          <button
                            onClick={() => setFeedSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
                          <ArrowUpDown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="text-zinc-500 hidden sm:inline">Sortera:</span>
                          <select
                            value={feedSort}
                            onChange={(e) => setFeedSort(e.target.value as "NEWEST" | "LIKES" | "COMMENTS")}
                            className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
                          >
                            <option value="NEWEST" className="bg-zinc-900 text-white">Nyast först</option>
                            <option value="LIKES" className="bg-zinc-900 text-white">Flest tassar 🐾</option>
                            <option value="COMMENTS" className="bg-zinc-900 text-white">Mest diskuterade 💬</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Feed Filter Chips */}
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
                        <button
                          onClick={() => setFeedFilter("ALL")}
                          className={`rounded-xl px-3 py-1.5 font-medium transition cursor-pointer shrink-0 ${
                            feedFilter === "ALL"
                              ? "bg-amber-500 text-zinc-950 font-bold"
                              : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                          }`}
                        >
                          Alla inlägg ({posts.length})
                        </button>
                        <button
                          onClick={() => setFeedFilter("LITTER")}
                          className={`rounded-xl px-3 py-1.5 font-medium transition cursor-pointer shrink-0 ${
                            feedFilter === "LITTER"
                              ? "bg-amber-500 text-zinc-950 font-bold"
                              : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                          }`}
                        >
                          🍼 Valpkullar & Avel
                        </button>
                        <button
                          onClick={() => setFeedFilter("PLAYDATE")}
                          className={`rounded-xl px-3 py-1.5 font-medium transition cursor-pointer shrink-0 ${
                            feedFilter === "PLAYDATE"
                              ? "bg-emerald-500 text-zinc-950 font-bold"
                              : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                          }`}
                        >
                          🎾 Lekträffar
                        </button>
                        <button
                          onClick={() => setFeedFilter("SITTING")}
                          className={`rounded-xl px-3 py-1.5 font-medium transition cursor-pointer shrink-0 ${
                            feedFilter === "SITTING"
                              ? "bg-indigo-500 text-white font-bold"
                              : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                          }`}
                        >
                          🏠 Hundvakt
                        </button>
                        <button
                          onClick={() => setFeedFilter("TIPS")}
                          className={`rounded-xl px-3 py-1.5 font-medium transition cursor-pointer shrink-0 ${
                            feedFilter === "TIPS"
                              ? "bg-amber-500 text-zinc-950 font-bold"
                              : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                          }`}
                        >
                          💡 Guider & Tips
                        </button>
                      </div>

                      {feedSearchQuery && (
                        <span className="text-[11px] text-zinc-400 shrink-0 ml-2">
                          Visar {filteredPosts.length} träffar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Posts Feed List */}
                  <div className="space-y-6">
                    {filteredPosts.length === 0 ? (
                      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-white">Inga inlägg matchade sökningen</h3>
                        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                          {feedSearchQuery
                            ? "Prova att rensa sökningen eller välja ett annat filter ovan."
                            : "Skriv ditt första inlägg i rutan ovan för att starta gemenskapen eller dela ett foto av din hund."}
                        </p>
                        {feedSearchQuery && (
                          <button
                            onClick={() => setFeedSearchQuery("")}
                            className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
                          >
                            Rensa sökning
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentProfile={profile}
                          currentRole={currentRole}
                          onLikePost={handleLikePost}
                          onAddComment={handleAddComment}
                          onOpenPostDetail={setSelectedPostForDetail}
                          onOpenImageLightbox={(imgs, idx) => handleOpenImageLightbox(imgs, idx, post)}
                          onDeletePost={handleDeletePost}
                          onEditPost={handleEditPost}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: DOG MATES (Matchmaking by Area from DB) */}
              {activeTab === "MATES" && <DogMatesView mates={dogMates} isMobileMode={isMobilePreviewMode} />}

              {/* VIEW 3: DOG SITTING & SWAP from DB */}
              {activeTab === "SITTING" && <DogSittingView sitters={dogSitters} isMobileMode={isMobilePreviewMode} />}

              {/* VIEW 4: BREEDS & HEALTH (Deep-dive with verified Wikimedia images from DB) */}
              {activeTab === "BREEDS" && (
                <BreedsView
                  breeds={breeds}
                  selectedBreedId={selectedBreedId || (breeds[0]?.id ?? "")}
                  onSelectBreedId={setSelectedBreedId}
                />
              )}

              {/* VIEW 5: KENNELS & BREEDERS DIRECTORY from DB */}
              {activeTab === "KENNELS" && (
                <KennelsView
                  kennels={kennels}
                  onSelectKennel={(k) => {
                    setSelectedKennelForProfile(k);
                    setIsKennelProfileOpen(true);
                  }}
                  isMobileMode={isMobilePreviewMode}
                />
              )}
            </div>

            {/* Right Sidebar (4 Cols) - Desktop only to keep mobile feed clean and fast */}
            <div className={`${isMobilePreviewMode || activeTab === "KENNELS" || activeTab === "BREEDS" ? "hidden" : "hidden lg:block lg:col-span-4"}`}>
              <RightSidebar
                currentRole={currentRole}
                profile={profile}
                kennels={kennels}
                onGenerateAIPost={handleGenerateAIPost}
                onSelectTab={setActiveTab}
                onUpdateProfile={(updated) => {
                  setProfile(updated);
                  try {
                    localStorage.setItem("urhund_active_user", JSON.stringify(updated));
                  } catch {}
                }}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onSelectKennel={(k) => {
                  setSelectedKennelForProfile(k);
                  setIsKennelProfileOpen(true);
                }}
              />
            </div>
          </div>
        )}
      </main>
        </div>
      </div>

      {/* Floating Toggle Button for Phone View Simulator */}
      <div className="fixed bottom-5 right-5 z-40 hidden md:block">
        <button
          type="button"
          onClick={() => {
            setIsMobilePreviewMode((prev) => {
              const next = !prev;
              try {
                localStorage.setItem("urhund_mobile_preview", String(next));
              } catch {}
              return next;
            });
          }}
          className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/95 px-3.5 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur hover:bg-zinc-800 transition cursor-pointer"
          title="Växla mellan telefonvy (390px) och skrivbordsvy"
        >
          <Smartphone className="h-4 w-4 text-amber-400" />
          <span>{isMobilePreviewMode ? "Växla till Desktopvy" : "📱 Simulera Mobilvy (390px)"}</span>
        </button>
      </div>
    </div>
  );
}