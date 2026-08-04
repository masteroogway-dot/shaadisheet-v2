"use client";

import { useState } from "react";
import {
  MusicPlatform,
  extractYouTubeId,
  getYouTubeThumbnail,
  formatMusicUrlForEmbed,
  getMusicPlatformLabel,
  getMusicPlatformColor,
} from "@/lib/music";

interface MusicPlayerProps {
  url: string;
  platform: MusicPlatform;
  compact?: boolean;
}

export default function MusicPlayer({ url, platform, compact = false }: MusicPlayerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!url || !platform) return null;

  const embedUrl = formatMusicUrlForEmbed(url, platform);

  // YouTube: show thumbnail with play button
  if (platform === "youtube") {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;

    if (expanded && embedUrl) {
      return (
        <div className={`relative w-full ${compact ? "h-[200px]" : "h-[280px]"} rounded-lg overflow-hidden mt-2`}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube player"
          />
        </div>
      );
    }

    return (
      <button
        onClick={() => setExpanded(true)}
        className="relative w-full group mt-2 cursor-pointer"
      >
        <img
          src={getYouTubeThumbnail(videoId)}
          alt="YouTube thumbnail"
          className={`w-full object-cover rounded-lg ${compact ? "h-[120px]" : "h-[160px]"}`}
        />
        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <i className="fas fa-play text-white text-lg ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-medium">
          YouTube
        </div>
      </button>
    );
  }

  // Spotify: always show embed iframe
  if (platform === "spotify" && embedUrl) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full"
          height={compact ? 80 : 152}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify player"
        />
      </div>
    );
  }

  // Apple Music: always show embed iframe
  if (platform === "apple" && embedUrl) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden">
        <iframe
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          frameBorder="0"
          height={compact ? 80 : 175}
          className="w-full"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src={embedUrl}
          title="Apple Music player"
        />
      </div>
    );
  }

  // Fallback: link button
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium ${getMusicPlatformColor(platform)} hover:opacity-80 transition-opacity`}
    >
      <i className="fas fa-external-link-alt" />
      Open in {getMusicPlatformLabel(platform)}
    </a>
  );
}
