"use client";

import { useMemo } from "react";

export type FaceStatus = "NO_FACE" | "OUTSIDE" | "GOOD";

export interface FaceBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

const GUIDE_BOX = {
  left: 0.25,
  right: 0.75,
  top: 0.15,
  bottom: 0.85,
};

export function useFaceValidation(landmarks: any[] | null) {
  return useMemo(() => {
    if (!landmarks || landmarks.length === 0) {
      return {
        status: "NO_FACE" as FaceStatus,
        isInsideGuide: false,
        faceBox: null,
      };
    }

    const xs = landmarks.map((point) => point.x);
    const ys = landmarks.map((point) => point.y);

    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);

    const faceBox: FaceBox = {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
    };

    const isInsideGuide =
      faceBox.left >= GUIDE_BOX.left &&
      faceBox.right <= GUIDE_BOX.right &&
      faceBox.top >= GUIDE_BOX.top &&
      faceBox.bottom <= GUIDE_BOX.bottom;

    return {
      status: isInsideGuide ? "GOOD" : "OUTSIDE",
      isInsideGuide,
      faceBox,
    };
  }, [landmarks]);
}
