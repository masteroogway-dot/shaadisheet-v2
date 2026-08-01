"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  width: number;
  height: number;
  favorite: boolean;
  tags: string;
  createdAt: string;
}

interface GalleryData {
  title: string;
  description: string;
  coverUrl: string;
  wedding: { name: string; weddingDate: string; weddingCity: string };
  photos: Photo[];
}

export default function GalleryPage() {
  const params = useParams();
  const token = params.token as string;
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/gallery/${token}`);
        if (!res.ok) {
          setError("Gallery not found or not published yet");
          return;
        }
        const data = await res.json();
        setGallery(data);
      } catch {
        setError("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handleFavorite = async (photoId: string) => {
    try {
      await fetch(`/api/gallery/${token}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });
      setGallery((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          photos: prev.photos.map((p) =>
            p.id === photoId ? { ...p, favorite: !p.favorite } : p
          ),
        };
      });
    } catch {}
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.filename || "wedding-photo.jpg";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(photo.url, "_blank");
    }
  };

  const filteredPhotos = gallery?.photos.filter((p) => {
    if (filter === "favorites") return p.favorite;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-images text-3xl text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gallery Unavailable</h1>
          <p className="text-gray-500">{error || "This gallery has not been published yet."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="relative h-64 md:h-80 overflow-hidden">
        {gallery.coverUrl ? (
          <img src={gallery.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-maroon to-maroon-light" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{gallery.title}</h1>
          {gallery.description && (
            <p className="text-white/80 text-sm md:text-base max-w-xl">{gallery.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-sm text-white/70">
            <span>{gallery.wedding.name}</span>
            {gallery.wedding.weddingDate && (
              <>
                <span>·</span>
                <span>{new Date(gallery.wedding.weddingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </>
            )}
            {gallery.wedding.weddingCity && (
              <>
                <span>·</span>
                <span>{gallery.wedding.weddingCity}</span>
              </>
            )}
          </div>
          <div className="mt-3 text-sm text-white/60">
            {gallery.photos.length} photos
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filter === "all" ? "bg-maroon text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All ({gallery.photos.length})
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filter === "favorites" ? "bg-maroon text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <i className="fas fa-heart mr-1" />
            Favorites ({gallery.photos.filter((p) => p.favorite).length})
          </button>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-images text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">
              {filter === "favorites" ? "No favorite photos yet" : "No photos in this gallery"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setPreviewPhoto(photo)}
              >
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(photo.id);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer ${
                      photo.favorite ? "bg-red-500 text-white" : "bg-black/40 text-white"
                    }`}
                  >
                    <i className={`${photo.favorite ? "fas" : "far"} fa-heart`} />
                  </button>
                </div>

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(photo);
                    }}
                    className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 cursor-pointer"
                  >
                    <i className="fas fa-download text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer z-10"
          >
            <i className="fas fa-times text-xl" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = filteredPhotos.findIndex((p) => p.id === previewPhoto.id);
              const prev = idx > 0 ? filteredPhotos[idx - 1] : filteredPhotos[filteredPhotos.length - 1];
              setPreviewPhoto(prev);
            }}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer z-10"
          >
            <i className="fas fa-chevron-left" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = filteredPhotos.findIndex((p) => p.id === previewPhoto.id);
              const next = idx < filteredPhotos.length - 1 ? filteredPhotos[idx + 1] : filteredPhotos[0];
              setPreviewPhoto(next);
            }}
            className="absolute right-16 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer z-10"
          >
            <i className="fas fa-chevron-right" />
          </button>

          <img
            src={previewPhoto.url}
            alt={previewPhoto.filename}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-sm rounded-full px-6 py-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite(previewPhoto.id);
              }}
              className={`text-white cursor-pointer ${previewPhoto.favorite ? "text-red-400" : ""}`}
            >
              <i className={`${previewPhoto.favorite ? "fas" : "far"} fa-heart text-lg`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(previewPhoto);
              }}
              className="text-white cursor-pointer"
            >
              <i className="fas fa-download text-lg" />
            </button>
            <span className="text-white/60 text-sm hidden md:inline">
              {previewPhoto.filename}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
