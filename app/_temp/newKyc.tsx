"use client";

import { useEffect } from "react";
import { useCamera } from "../_hooks/camera";
import { useHandsfree } from "../_hooks/useHandsfree";
import FaceGuide from "./faceGuide";
import { useFaceValidation } from "../_hooks/useFaceVal";

export default function CameraView() {
  const { videoRef, startCamera, error, ready, stopCamera } = useCamera();

  const { faceDetected, landmarks } = useHandsfree(videoRef);
  const { status, isInsideGuide, faceBox } = useFaceValidation(landmarks);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    // <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    //   <video
    //     ref={videoRef}
    //     autoPlay
    //     playsInline
    //     muted
    //     style={{
    //       width: 400,
    //       height: 300,
    //       background: "#000",
    //       borderRadius: 12,
    //     }}
    //   />

    //   {error && <p style={{ color: "red" }}>{error}</p>}

    //   {ready && <p style={{ color: "green" }}>Camera ready ✅</p>}

    //   <p>Face Status: {faceDetected ? "🙂 Face Detected" : "❌ No Face"}</p>
    // </div>
    <div className="flex items-center justify-center flex-col gap-20">
      <div className="relative w-[500px] h-[375px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover rounded-xl"
        />

        <FaceGuide isValid={isInsideGuide} />
      </div>
      <p>
        {status === "NO_FACE" && "❌ No face detected"}

        {status === "OUTSIDE" && "⚠️ Place your face inside the guide"}

        {status === "GOOD" && "✅ Perfect position"}
      </p>
    </div>
  );
}
