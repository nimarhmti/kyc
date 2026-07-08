"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { DetectionResult, FaceBox } from "../kyc";
// import { DetectionResult, FaceBox } from "@/types/kyc";

const MODEL_URL = "/models";
// DETECTION_INTERVAL_MS = 300 → check the face position 3–4 times per second (fast enough to feel responsive, slow enough not to hammer the CPU)
const DETECTION_INTERVAL_MS = 300;

// Tunable thresholds for what counts as "centered"
const CENTER_TOLERANCE_RATIO = 0.15; // how far off-center (as % of frame) is still OK
const MIN_FACE_AREA_RATIO = 0.08; // face too small = too far away
const MAX_FACE_AREA_RATIO = 0.6; // face too big = too close

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [result, setResult] = useState<DetectionResult>({
    status: "loading",
    box: null,
    message: "Loading face detection models...",
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load models once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) {
          setModelsLoaded(true);
          setResult({
            status: "no-face",
            box: null,
            message: "Position your face in the frame",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setResult({
            status: "error",
            box: null,
            message: "Failed to load face detection models",
          });
        }
        console.error("Face-api model load error:", err);
      }
    }

    loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  const evaluateFacePosition = useCallback(
    (
      box: FaceBox,
      frameWidth: number,
      frameHeight: number,
    ): DetectionResult => {
      const faceCenterX = box.x + box.width / 2;
      const faceCenterY = box.y + box.height / 2;
      const frameCenterX = frameWidth / 2;
      const frameCenterY = frameHeight / 2;

      const offsetXRatio = Math.abs(faceCenterX - frameCenterX) / frameWidth;
      const offsetYRatio = Math.abs(faceCenterY - frameCenterY) / frameHeight;

      const faceAreaRatio =
        (box.width * box.height) / (frameWidth * frameHeight);

      if (faceAreaRatio < MIN_FACE_AREA_RATIO) {
        return {
          status: "off-center",
          box,
          message: "Move closer to the camera",
        };
      }
      if (faceAreaRatio > MAX_FACE_AREA_RATIO) {
        return {
          status: "off-center",
          box,
          message: "Move back from the camera",
        };
      }
      if (
        offsetXRatio > CENTER_TOLERANCE_RATIO ||
        offsetYRatio > CENTER_TOLERANCE_RATIO
      ) {
        return {
          status: "off-center",
          box,
          message: "Center your face in the frame",
        };
      }

      return {
        status: "centered",
        box,
        message: "Face centered — ready to record",
      };
    },
    [],
  );

  useEffect(() => {
    if (!modelsLoaded) return;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) return;

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        setResult({
          status: "no-face",
          box: null,
          message: "No face detected — position your face in the frame",
        });
        return;
      }

      const box: FaceBox = {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      };

      const evaluated = evaluateFacePosition(
        box,
        video.videoWidth,
        video.videoHeight,
      );
      setResult(evaluated);
    }, DETECTION_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [modelsLoaded, videoRef, evaluateFacePosition]);

  return { ...result, modelsLoaded };
}
