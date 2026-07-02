"use client";

import { useEffect, useRef, useState } from "react";
import Handsfree from "handsfree";

export function useHandsfree(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const handsfreeRef = useRef<any>(null);

  const [landmarks, setLandmarks] = useState<any>(null);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Handsfree
    const handsfree = new Handsfree({
      hands: false,
      facemesh: true,
    });

    handsfreeRef.current = handsfree;

    // Start Handsfree
    handsfree.start();

    // Listen for face data
    handsfree.use("logger", (data: any) => {
      const faces = data?.facemesh?.multiFaceLandmarks;

      if (faces && faces.length > 0) {
        setFaceDetected(true);
        setLandmarks(faces[0]); // first face only
      } else {
        setFaceDetected(false);
        setLandmarks(null);
      }
    });

    return () => {
      handsfree.stop();
      handsfreeRef.current = null;
    };
  }, [videoRef]);

  return {
    landmarks,
    faceDetected,
  };
}
