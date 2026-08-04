export type MusicPlatform = "youtube" | "spotify" | "apple" | null;

export function detectMusicPlatform(url: string): MusicPlatform {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("youtube.com/embed")) {
    return "youtube";
  }
  if (lower.includes("open.spotify.com") || lower.includes("spotify:track:")) {
    return "spotify";
  }
  if (lower.includes("music.apple.com") || lower.includes("itunes.apple.com")) {
    return "apple";
  }
  return null;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

export function extractSpotifyId(url: string): string | null {
  if (!url) return null;
  // open.spotify.com/track/TRACK_ID
  const trackMatch = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (trackMatch) return trackMatch[1];
  // spotify:track:TRACK_ID
  const uriMatch = url.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  return null;
}

export function parseAppleMusicUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // music.apple.com/{country}/{kind}/{id}... → embed path
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 3) {
      // Rebuild as embed URL: https://embed.music.apple.com/{country}/{kind}/{id}?itsct=...
      const country = parts[0];
      const kind = parts[1];
      const idWithParams = parts[2];
      const id = idWithParams.split("?")[0];
      return `https://embed.music.apple.com/${country}/${kind}/${id}`;
    }
  } catch {
    // Invalid URL
  }
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function formatMusicUrlForEmbed(url: string, platform: MusicPlatform): string | null {
  if (!url || !platform) return null;

  switch (platform) {
    case "youtube": {
      const id = extractYouTubeId(url);
      return id ? `https://www.youtube.com/embed/${id}?enablejsapi=1` : null;
    }
    case "spotify": {
      const id = extractSpotifyId(url);
      return id ? `https://open.spotify.com/embed/track/${id}?theme=0` : null;
    }
    case "apple": {
      return parseAppleMusicUrl(url);
    }
    default:
      return null;
  }
}

export function getMusicPlatformLabel(platform: MusicPlatform): string {
  switch (platform) {
    case "youtube": return "YouTube";
    case "spotify": return "Spotify";
    case "apple": return "Apple Music";
    default: return "";
  }
}

export function getMusicPlatformColor(platform: MusicPlatform): string {
  switch (platform) {
    case "youtube": return "bg-red-100 text-red-700";
    case "spotify": return "bg-green-100 text-green-700";
    case "apple": return "bg-pink-100 text-pink-700";
    default: return "bg-gray-100 text-gray-700";
  }
}
