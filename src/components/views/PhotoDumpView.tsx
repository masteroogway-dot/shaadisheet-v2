"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useFaceDetection } from "@/hooks/useFaceDetection";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  source?: string;
  width: number;
  height: number;
  size: number;
  mime: string;
  favorite: boolean;
  tags: string;
  order: number;
  createdAt: string;
}

interface PhotoDumpData {
  id: string;
  weddingId: string;
  shareToken: string;
  title: string;
  description: string;
  coverUrl: string;
  isPublished: boolean;
  photos: Photo[];
}

interface Props {
  weddingId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wedding: any;
  canEdit: boolean;
  onToast: (msg: string, type?: "success" | "error") => void;
}

export default function PhotoDumpView({ weddingId, canEdit, onToast }: Props) {
  const { detectFaces, isDetecting, progress } = useFaceDetection();
  const [photoDump, setPhotoDump] = useState<PhotoDumpData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [titleValue, setTitleValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [faceDetectResult, setFaceDetectResult] = useState<{ processed: number; totalFaces: number } | null>(null);
  const [faceSearchQuery, setFaceSearchQuery] = useState("");
  const [faceSearchResults, setFaceSearchResults] = useState<any[] | null>(null);
  const [faceLabels, setFaceLabels] = useState<string[]>([]);
  const [labelModalPhoto, setLabelModalPhoto] = useState<any>(null);
  const [labelModalFaces, setLabelModalFaces] = useState<any[]>([]);
  const [labelModalLabel, setLabelModalLabel] = useState("");
  const [labelingFaces, setLabelingFaces] = useState(false);
  const [faceClusters, setFaceClusters] = useState<any[]>([]);
  const [showFaceLabeler, setShowFaceLabeler] = useState(false);
  const [loadingClusters, setLoadingClusters] = useState(false);
  const [clusterLabels, setClusterLabels] = useState<Record<string, string>>({});
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleImporting, setGoogleImporting] = useState(false);
  const [googlePickerSession, setGooglePickerSession] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPhotoUrl = (photo: Photo, size: "thumb" | "full" = "thumb") => {
    if (photo.source === "google") {
      const params = size === "thumb" ? "w400-h300-c" : "w1920-h1080-c";
      return `/api/weddings/${weddingId}/photos/proxy?photoId=${photo.id}&size=${size}`;
    }
    return size === "thumb" ? (photo.thumbnailUrl || photo.url) : photo.url;
  };

  const loadPhotos = useCallback(async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos`);
      if (res.ok) {
        const data = await res.json();
        setPhotoDump(data);
        setTitleValue(data.title || "Wedding Photos");
        setDescValue(data.description || "");
      }
    } catch (err) {
      console.error("Failed to load photos:", err);
    }
  }, [weddingId]);

  const checkGoogleConnection = useCallback(async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/google-picker`);
      if (res.ok) {
        const data = await res.json();
        setGoogleConnected(data.connected);
      }
    } catch {}
  }, [weddingId]);

  const handleGooglePicker = async () => {
    if (!googleConnected) {
      window.location.href = "/api/auth/google";
      return;
    }

    setGoogleImporting(true);
    try {
      const createRes = await fetch(`/api/weddings/${weddingId}/photos/google-picker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        onToast(err.error || "Failed to open Google Photos", "error");
        setGoogleImporting(false);
        return;
      }

      const { sessionId, pickerUri } = await createRes.json();
      setGooglePickerSession(sessionId);

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(pickerUri, "google-picker", `width=${width},height=${height},left=${left},top=${top}`);
    } catch {
      onToast("Failed to open Google Photos picker", "error");
    }
    setGoogleImporting(false);
  };

  const handleGoogleImport = async () => {
    if (!googlePickerSession) return;

    setGoogleImporting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/google-picker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", sessionId: googlePickerSession }),
      });

      if (res.ok) {
        const data = await res.json();
        onToast(`${data.count} photos imported from Google Photos!`);
        setGooglePickerSession(null);
        await loadPhotos();
      } else {
        const err = await res.json();
        onToast(err.error || "Import failed", "error");
      }
    } catch {
      onToast("Import failed", "error");
    }
    setGoogleImporting(false);
  };

  useEffect(() => {
    checkGoogleConnection();
  }, [checkGoogleConnection]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/weddings/${weddingId}/photos`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setPhotoDump(data);
          setTitleValue(data.title || "Wedding Photos");
          setDescValue(data.description || "");
        }
      } catch (err) {
        console.error("Failed to load photos:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [weddingId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const BATCH_SIZE = 5;
    const totalBatches = Math.ceil(files.length / BATCH_SIZE);
    let uploaded = 0;
    let failed = 0;

    try {
      for (let batch = 0; batch < totalBatches; batch++) {
        const start = batch * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, files.length);
        const formData = new FormData();
        formData.append("weddingId", weddingId);
        for (let i = start; i < end; i++) {
          formData.append("files", files[i]);
        }

        try {
          const res = await fetch(`/api/weddings/${weddingId}/photos/upload`, {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const result = await res.json();
            uploaded += result.photos.length;
          } else {
            failed += end - start;
          }
        } catch {
          failed += end - start;
        }
        setUploadProgress(Math.round(((batch + 1) / totalBatches) * 100));
      }

      if (uploaded > 0) {
        onToast(`${uploaded} photos uploaded!${failed ? ` ${failed} failed.` : ""}`);
        await loadPhotos();
      } else {
        onToast("Upload failed", "error");
      }
    } catch (err) {
      onToast("Upload failed", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFavorite = async (photoId: string) => {
    try {
      await fetch(`/api/weddings/${weddingId}/photos/${photoId}`, {
        method: "PATCH",
        body: JSON.stringify({ photoId }),
      });
      await loadPhotos();
    } catch (err) {
      onToast("Failed to update", "error");
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      await fetch(`/api/weddings/${weddingId}/photos/${photoId}`, {
        method: "DELETE",
        body: JSON.stringify({ photoId }),
      });
      onToast("Photo deleted");
      await loadPhotos();
    } catch (err) {
      onToast("Failed to delete", "error");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotos.size === 0) return;
    if (!confirm(`Delete ${selectedPhotos.size} photos?`)) return;

    try {
      for (const photoId of selectedPhotos) {
        await fetch(`/api/weddings/${weddingId}/photos/${photoId}`, {
          method: "DELETE",
          body: JSON.stringify({ photoId }),
        });
      }
      onToast(`${selectedPhotos.size} photos deleted`);
      setSelectedPhotos(new Set());
      await loadPhotos();
    } catch (err) {
      onToast("Failed to delete", "error");
    }
  };

  const handlePublish = async (publish: boolean) => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/upload`, {
        method: "PATCH",
        body: JSON.stringify({ action: "publish", publish }),
      });
      onToast(publish ? "Gallery published!" : "Gallery unpublished");
      await loadPhotos();
    } catch (err) {
      onToast("Failed to update", "error");
    }
  };

  const handleRegenerateToken = async () => {
    if (!confirm("This will break existing share links. Continue?")) return;
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/upload`, {
        method: "PATCH",
        body: JSON.stringify({ action: "regenerate" }),
      });
      onToast("New share link generated");
      await loadPhotos();
    } catch (err) {
      onToast("Failed to regenerate", "error");
    }
  };

  const handleSaveTitle = async () => {
    try {
      await fetch(`/api/weddings/${weddingId}/photos/upload`, {
        method: "PATCH",
        body: JSON.stringify({ action: "updateSettings", title: titleValue, description: descValue }),
      });
      await loadPhotos();
    } catch {
      onToast("Failed to save", "error");
    }
  };

  const handleSaveDesc = async () => {
    try {
      await fetch(`/api/weddings/${weddingId}/photos/upload`, {
        method: "PATCH",
        body: JSON.stringify({ action: "updateSettings", title: titleValue, description: descValue }),
      });
      await loadPhotos();
    } catch {
      onToast("Failed to save", "error");
    }
  };

  const handleTagSelected = async () => {
    if (selectedPhotos.size === 0 || !tagInput.trim()) return;
    try {
      await fetch(`/api/weddings/${weddingId}/photos/upload`, {
        method: "PATCH",
        body: JSON.stringify({ action: "tag", photoIds: Array.from(selectedPhotos), tag: tagInput.trim() }),
      });
      onToast(`Tagged ${selectedPhotos.size} photos`);
      setTagInput("");
      setSelectedPhotos(new Set());
      await loadPhotos();
    } catch (err) {
      onToast("Failed to tag", "error");
    }
  };

  const filteredPhotos = photoDump?.photos.filter((p) => {
    if (filter === "favorites") return p.favorite;
    return true;
  }) || [];

  const totalSize = photoDump?.photos.reduce((acc, p) => acc + (p.size || 0), 0) || 0;
  const favCount = photoDump?.photos.filter((p) => p.favorite).length || 0;

  const shareUrl = photoDump?.shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/gallery/${photoDump.shareToken}`
    : "";

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      onToast("Share link copied!");
    }
  };

  const handleDetectFaces = async () => {
    if (!photoDump?.photos) return;

    const unprocessed = photoDump.photos.filter((p: any) => !p.facesProcessed);
    if (unprocessed.length === 0) {
      onToast("All photos already processed");
      return;
    }

    setFaceDetectResult(null);
    try {
      const faces = await detectFaces(
        unprocessed.map((p) => ({ id: p.id, url: p.url, width: p.width, height: p.height })),
        (current, total) => {
          setUploadProgress(Math.round((current / total) * 100));
        }
      );

      if (faces.length > 0) {
        const res = await fetch(`/api/weddings/${weddingId}/photos/store-faces`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ faces }),
        });
        if (res.ok) {
          const result = await res.json();
          setFaceDetectResult({ processed: unprocessed.length, totalFaces: result.stored });
          onToast(`Detected ${result.stored} faces in ${unprocessed.length} photos`);
          await loadPhotos();
        } else {
          onToast("Failed to store face data", "error");
        }
      } else {
        onToast("No faces detected in the photos");
      }
    } catch {
      onToast("Face detection failed", "error");
    } finally {
      setUploadProgress(0);
    }
  };

  const handleFaceSearch = async () => {
    if (!faceSearchQuery.trim()) return;
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/face-search?label=${encodeURIComponent(faceSearchQuery.trim())}`);
      if (res.ok) {
        const result = await res.json();
        setFaceSearchResults(result.photos);
        if (result.photos.length === 0) {
          onToast(`No photos found for "${faceSearchQuery}"`);
        } else {
          onToast(`Found ${result.photos.length} photos for "${faceSearchQuery}"`);
        }
      }
    } catch {
      onToast("Search failed", "error");
    }
  };

  const loadFaceLabels = async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/labels`);
      if (res.ok) {
        const data = await res.json();
        setFaceLabels(data.labels || []);
      }
    } catch {}
  };

  const handleLabelFaces = async (faceIds: string[], label: string) => {
    if (!label.trim() || faceIds.length === 0) return;
    setLabelingFaces(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/label-faces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceIds, label: label.trim() }),
      });
      if (res.ok) {
        onToast(`Labeled ${faceIds.length} faces as "${label}"`);
        setLabelModalLabel("");
      } else {
        onToast("Failed to label faces", "error");
      }
    } catch {
      onToast("Failed to label faces", "error");
    } finally {
      setLabelingFaces(false);
    }
  };

  const loadClusters = async () => {
    setLoadingClusters(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/clusters`);
      if (res.ok) {
        const data = await res.json();
        setFaceClusters(data.clusters || []);
        const labels: Record<string, string> = {};
        for (const c of data.clusters || []) {
          if (c.label) labels[c.id] = c.label;
        }
        setClusterLabels(labels);
      }
    } catch {}
    setLoadingClusters(false);
  };

  const handleLabelCluster = async (clusterId: string, faceIds: string[], label: string) => {
    if (!label.trim()) return;
    try {
      const res = await fetch(`/api/weddings/${weddingId}/photos/label-faces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceIds, label: label.trim() }),
      });
      if (res.ok) {
        setClusterLabels((prev) => ({ ...prev, [clusterId]: label.trim() }));
        onToast(`Labeled ${faceIds.length} faces as "${label.trim()}"`);
        loadFaceLabels();
      }
    } catch {
      onToast("Failed to label", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Dump</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and organize all your wedding photos in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button
                onClick={handleGooglePicker}
                disabled={googleImporting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {googleImporting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </span>
                ) : googlePickerSession ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500" />
                    Import Selected
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <i className="fab fa-google text-blue-500" />
                    Google Photos
                  </span>
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-maroon text-white rounded-lg font-medium hover:bg-maroon-light transition-colors disabled:opacity-50 cursor-pointer"
              >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <i className="fas fa-cloud-upload-alt" />
                  Upload Photos
                </span>
              )}
            </button>
            </>
          )}
        </div>
      </div>

      {uploading && (
        <div className="mb-4 bg-maroon/10 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-maroon font-medium mb-2">
            <span>Uploading photos...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-maroon/20 rounded-full h-2">
            <div
              className="bg-maroon h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{photoDump?.photos.length || 0}</div>
              <div className="text-xs text-gray-500">Photos</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{favCount}</div>
              <div className="text-xs text-gray-500">Favorites</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{(totalSize / (1024 * 1024)).toFixed(1)}MB</div>
              <div className="text-xs text-gray-500">Total Size</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {photoDump?.isPublished && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Published
              </div>
            )}

            {canEdit && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <i className="fas fa-cog" />
              </button>
            )}
          </div>
        </div>

        {showSettings && (
          <div className="border-t border-gray-100 pt-4 mt-2 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gallery Title</label>
              <div className="flex gap-2">
                <input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20"
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-3 py-2 bg-maroon text-white rounded-lg text-sm hover:bg-maroon-light cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 resize-none"
              />
              <button
                onClick={handleSaveDesc}
                className="mt-1 px-3 py-1.5 bg-maroon text-white rounded-lg text-sm hover:bg-maroon-light cursor-pointer"
              >
                Save Description
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePublish(!photoDump?.isPublished)}
                className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                  photoDump?.isPublished
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {photoDump?.isPublished ? "Unpublish" : "Publish Gallery"}
              </button>

              {photoDump?.isPublished && (
                <>
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 cursor-pointer"
                  >
                    <i className="fas fa-link mr-2" />
                    Copy Share Link
                  </button>
                  <button
                    onClick={handleRegenerateToken}
                    className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 cursor-pointer"
                  >
                    <i className="fas fa-sync-alt mr-2" />
                    Regenerate Link
                  </button>
                </>
              )}
            </div>

            {photoDump?.shareToken && (
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Share URL</label>
                <code className="text-xs text-gray-700 break-all">{shareUrl}</code>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Face Detection & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <i className="fas fa-brain text-purple-500" />
          <h3 className="font-semibold text-gray-900">AI Face Search</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {canEdit && (
            <button
              onClick={handleDetectFaces}
              disabled={isDetecting}
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {isDetecting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  {progress ? `Detecting ${progress.current}/${progress.total}...` : "Loading AI models..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <i className="fas fa-magic" />
                  Detect Faces
                </span>
              )}
            </button>
          )}
          <div className="flex-1 flex gap-2">
            <input
              value={faceSearchQuery}
              onChange={(e) => setFaceSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFaceSearch()}
              placeholder="Search by person name..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <button
              onClick={handleFaceSearch}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 cursor-pointer"
            >
              <i className="fas fa-search mr-1" />
              Search
            </button>
            {faceSearchResults && (
              <button
                onClick={() => { setFaceSearchResults(null); setFaceSearchQuery(""); }}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {faceDetectResult && (
          <div className="mt-3 text-sm text-purple-600 bg-purple-50 rounded-lg p-3">
            <i className="fas fa-check-circle mr-1" />
            Processed {faceDetectResult.processed} photos, found {faceDetectResult.totalFaces} faces
          </div>
        )}
        {faceLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-500 mr-1">Labeled:</span>
            {faceLabels.map((label) => (
              <button
                key={label}
                onClick={() => { setFaceSearchQuery(label); }}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-100 cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {faceSearchResults && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Search Results ({faceSearchResults.length} photos)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {faceSearchResults.map((photo: any) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 border-purple-200"
                onClick={() => setPreviewPhoto(photo)}
              >
                <img
                  src={getPhotoUrl(photo, "thumb")}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFavorite(photo.id); }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer ${
                      photo.favorite ? "bg-red-500 text-white" : "bg-black/40 text-white"
                    }`}
                  >
                    <i className={`${photo.favorite ? "fas" : "far"} fa-heart`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Face Labeler - Name the people in your photos */}
      {canEdit && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="fas fa-id-badge text-amber-500" />
              <h3 className="font-semibold text-gray-900">Name Faces</h3>
              <span className="text-xs text-gray-500">(so guests can search by name)</span>
            </div>
            <button
              onClick={() => { setShowFaceLabeler(!showFaceLabeler); if (!showFaceLabeler) loadClusters(); }}
              className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 cursor-pointer"
            >
              {showFaceLabeler ? "Close" : "Open Labeler"}
            </button>
          </div>

          {showFaceLabeler && (
            <div>
              {loadingClusters ? (
                <div className="flex items-center gap-2 py-8 justify-center text-gray-500">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  Analyzing faces...
                </div>
              ) : faceClusters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-user-group text-3xl text-gray-300 mb-3 block" />
                  <p className="text-sm">No faces detected yet. Click &quot;Detect Faces&quot; first.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {faceClusters.map((cluster: any) => {
                    const labeled = clusterLabels[cluster.id];
                    return (
                      <div key={cluster.id} className={`border rounded-lg p-3 transition-colors ${labeled ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex -space-x-2">
                            {cluster.faces.slice(0, 5).map((face: any, i: number) => (
                              <div key={i} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-gray-200 relative">
                                <img
                                  src={face.photoUrl}
                                  alt=""
                                  className="absolute"
                                  style={{
                                    width: `${100 / Math.max(face.w, 0.01)}%`,
                                    height: `${100 / Math.max(face.h, 0.01)}%`,
                                    left: `${-face.x * 100 / Math.max(face.w, 0.01)}%`,
                                    top: `${-face.y * 100 / Math.max(face.h, 0.01)}%`,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {cluster.faces.length} photo{cluster.faces.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            value={clusterLabels[cluster.id] || ""}
                            onChange={(e) => setClusterLabels((prev) => ({ ...prev, [cluster.id]: e.target.value }))}
                            placeholder="Type a name (e.g. Ananya)"
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleLabelCluster(
                                  cluster.id,
                                  cluster.faces.map((f: any) => f.id),
                                  clusterLabels[cluster.id] || ""
                                );
                              }
                            }}
                          />
                          <button
                            onClick={() =>
                              handleLabelCluster(
                                cluster.id,
                                cluster.faces.map((f: any) => f.id),
                                clusterLabels[cluster.id] || ""
                              )
                            }
                            disabled={!clusterLabels[cluster.id]?.trim()}
                            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-40 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                        {labeled && (
                          <div className="mt-1.5 text-xs text-green-600">
                            <i className="fas fa-check-circle mr-1" />
                            Labeled as &quot;{labeled}&quot;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === "all" ? "bg-maroon text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({photoDump?.photos.length || 0})
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === "favorites" ? "bg-maroon text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className="fas fa-heart mr-1" />
            Favorites ({favCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selectedPhotos.size > 0 && canEdit && (
            <>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Tag name..."
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-maroon/20"
                onKeyDown={(e) => e.key === "Enter" && handleTagSelected()}
              />
              <button
                onClick={handleTagSelected}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 cursor-pointer"
              >
                Tag ({selectedPhotos.size})
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 cursor-pointer"
              >
                Delete ({selectedPhotos.size})
              </button>
            </>
          )}

          <button
            onClick={() => setViewMode("grid")}
            className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
              viewMode === "grid" ? "bg-gray-200 text-gray-900" : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-grid-2" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
              viewMode === "list" ? "bg-gray-200 text-gray-900" : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-list" />
          </button>
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-images text-3xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === "favorites" ? "No favorite photos yet" : "No photos uploaded yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            {filter === "favorites"
              ? "Heart your favorite photos to see them here"
              : "Upload your wedding photos to share them with guests. Supports JPG, PNG, HEIC, and more."}
          </p>
          {canEdit && filter !== "favorites" && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-maroon text-white rounded-xl font-medium hover:bg-maroon-light transition-colors cursor-pointer"
            >
              <i className="fas fa-cloud-upload-alt mr-2" />
              Upload Your First Photos
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedPhotos.has(photo.id)
                  ? "border-maroon ring-2 ring-maroon/20"
                  : "border-transparent hover:border-gray-200"
              }`}
              onClick={() => {
                if (selectedPhotos.has(photo.id)) {
                  setSelectedPhotos((prev) => {
                    const next = new Set(prev);
                    next.delete(photo.id);
                    return next;
                  });
                } else if (selectedPhotos.size > 0) {
                  setSelectedPhotos((prev) => new Set(prev).add(photo.id));
                } else {
                  setPreviewPhoto(photo);
                }
              }}
              onDoubleClick={() => setPreviewPhoto(photo)}
            >
              <img
                src={getPhotoUrl(photo, "full")}
                alt={photo.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="absolute top-2 left-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotos((prev) => {
                      const next = new Set(prev);
                      if (next.has(photo.id)) next.delete(photo.id);
                      else next.add(photo.id);
                      return next;
                    });
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                    selectedPhotos.has(photo.id)
                      ? "bg-maroon text-white"
                      : "bg-black/40 text-white/80 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {selectedPhotos.has(photo.id) ? (
                    <i className="fas fa-check" />
                  ) : (
                    <i className="far fa-square" />
                  )}
                </button>
              </div>

              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(photo.id);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                    photo.favorite
                      ? "bg-red-500 text-white"
                      : "bg-black/40 text-white/80 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <i className={`${photo.favorite ? "fas" : "far"} fa-heart`} />
                </button>
              </div>

              {canEdit && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() =>
                  setSelectedPhotos((prev) => {
                    const next = new Set(prev);
                    if (next.has(photo.id)) next.delete(photo.id);
                    else next.add(photo.id);
                    return next;
                  })
                }
                className={`w-6 h-6 rounded flex items-center justify-center border cursor-pointer ${
                  selectedPhotos.has(photo.id)
                    ? "bg-maroon border-maroon text-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {selectedPhotos.has(photo.id) && <i className="fas fa-check text-xs" />}
              </button>

              <img
                src={getPhotoUrl(photo, "thumb")}
                alt={photo.filename}
                className="w-12 h-12 rounded-lg object-cover"
              />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{photo.filename}</div>
                <div className="text-xs text-gray-500">
                  {photo.width}x{photo.height} · {(photo.size / 1024).toFixed(0)}KB
                </div>
              </div>

              {JSON.parse(photo.tags || "[]").length > 0 && (
                <div className="flex gap-1">
                  {JSON.parse(photo.tags || "[]").map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleFavorite(photo.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  photo.favorite ? "text-red-500" : "text-gray-400 hover:text-red-400"
                }`}
              >
                <i className={`${photo.favorite ? "fas" : "far"} fa-heart`} />
              </button>

              {canEdit && (
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <i className="fas fa-trash text-sm" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
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
              const photos = filteredPhotos;
              const idx = photos.findIndex((p) => p.id === previewPhoto.id);
              const prev = idx > 0 ? photos[idx - 1] : photos[photos.length - 1];
              setPreviewPhoto(prev);
            }}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer z-10"
          >
            <i className="fas fa-chevron-left" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const photos = filteredPhotos;
              const idx = photos.findIndex((p) => p.id === previewPhoto.id);
              const next = idx < photos.length - 1 ? photos[idx + 1] : photos[0];
              setPreviewPhoto(next);
            }}
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer z-10"
          >
            <i className="fas fa-chevron-right" />
          </button>

          <img
            src={previewPhoto.url}
            alt={previewPhoto.filename}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-sm rounded-full px-6 py-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite(previewPhoto.id);
              }}
              className={`text-white cursor-pointer ${previewPhoto.favorite ? "text-red-400" : ""}`}
            >
              <i className={`${previewPhoto.favorite ? "fas" : "far"} fa-heart text-lg`} />
            </button>
            <span className="text-white/80 text-sm">{previewPhoto.filename}</span>
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(previewPhoto.id);
                  setPreviewPhoto(null);
                }}
                className="text-white/60 hover:text-red-400 cursor-pointer"
              >
                <i className="fas fa-trash" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
