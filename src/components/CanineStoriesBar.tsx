"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { CanineStory } from "./StoryViewerModal";
import { UserProfile } from "@/data/mockSocial";

interface CanineStoriesBarProps {
  stories: CanineStory[];
  currentProfile: UserProfile;
  onOpenCreateStory: () => void;
  onSelectStory: (index: number) => void;
}

export function CanineStoriesBar({
  stories,
  currentProfile,
  onOpenCreateStory,
  onSelectStory,
}: CanineStoriesBarProps) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4 shadow-xl">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {/* Create Story Button */}
        <button
          onClick={onOpenCreateStory}
          className="group flex flex-col items-center shrink-0 w-20 text-center cursor-pointer"
        >
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950/80 text-zinc-400 group-hover:border-amber-500 group-hover:text-amber-400 group-hover:scale-105 transition-all shadow-md">
            {currentProfile.avatar ? (
              <img
                src={currentProfile.avatar}
                alt="Min profil"
                className="h-full w-full object-cover rounded-2xl opacity-70 group-hover:opacity-100 transition"
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl group-hover:bg-black/20 transition">
              <PlusCircle className="h-6 w-6 text-amber-400 drop-shadow" />
            </div>
          </div>
          <span className="mt-1.5 text-[11px] font-bold text-white group-hover:text-amber-300 truncate w-full">
            Skapa händelse
          </span>
          <span className="text-[9px] text-zinc-500">24 timmar</span>
        </button>

        {stories.length > 0 && (
          <div className="h-12 w-[1px] bg-zinc-800 shrink-0 mx-1" />
        )}

        {stories.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 pl-3 italic">
            <span>Inga aktiva händelser just nu. Klicka för att dela ett foto från din hunds dag! 🐾</span>
          </div>
        )}

        {/* Existing Canine Stories */}
        {stories.map((story, idx) => (
          <button
            key={story.id}
            onClick={() => onSelectStory(idx)}
            className="group flex flex-col items-center shrink-0 w-20 text-center cursor-pointer transition-transform hover:scale-105"
          >
            <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 shadow-lg shadow-amber-500/10">
              <div className="h-13 w-13 sm:h-15 sm:w-15 rounded-[14px] overflow-hidden bg-zinc-950 p-0.5">
                <img
                  src={story.mediaUrl}
                  alt={story.dogName}
                  className="h-full w-full object-cover rounded-[12px] group-hover:scale-110 transition duration-300"
                />
              </div>
            </div>
            <span className="mt-1 text-[11px] font-bold text-zinc-200 group-hover:text-amber-300 truncate w-full">
              {story.dogName}
            </span>
            <span className="text-[9px] text-zinc-500 truncate w-full">
              {story.city}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
