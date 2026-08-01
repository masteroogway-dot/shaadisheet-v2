"use client";

import { useState, useRef, useCallback } from "react";

let faceapi: any = null;
let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return faceapi;
  const mod = await import("@vladmandic/face-api");
  faceapi = mod;

  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

  modelsLoaded = true;
  return faceapi;
}

interface DetectedFace {
  photoId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  embedding: number[];
}

interface UseFaceDetectionReturn {
  detectFaces: (photos: Array<{ id: string; url: string; width: number; height: number }>, onProgress?: (current: number, total: number) => void) => Promise<DetectedFace[]>;
  isDetecting: boolean;
  progress: { current: number; total: number } | null;
}

export function useFaceDetection(): UseFaceDetectionReturn {
  const [isDetecting, setIsDetecting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const detectFaces = useCallback(async (
    photos: Array<{ id: string; url: string; width: number; height: number }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<DetectedFace[]> => {
    setIsDetecting(true);
    setProgress({ current: 0, total: photos.length });

    try {
      const api = await loadModels();
      const allFaces: DetectedFace[] = [];

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setProgress({ current: i + 1, total: photos.length });
        onProgress?.(i + 1, photos.length);

        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = photo.url;
          });

          const detections = await api
            .detectAllFaces(img, new api.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors();

          for (const detection of detections) {
            const box = detection.detection.box;
            const embedding = Array.from(detection.descriptor) as number[];

            allFaces.push({
              photoId: photo.id,
              x: box.x / photo.width,
              y: box.y / photo.height,
              w: box.width / photo.width,
              h: box.height / photo.height,
              embedding,
            });
          }
        } catch (err) {
          console.error(`Face detection failed for photo ${photo.id}:`, err);
        }
      }

      return allFaces;
    } finally {
      setIsDetecting(false);
      setProgress(null);
    }
  }, []);

  return { detectFaces, isDetecting, progress };
}
