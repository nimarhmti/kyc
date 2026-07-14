"use client";

import FaceRecorder from "@/module/face-api/FaceRecorder";
import { useCallback, useState } from "react";
// import FaceRecorder from "@/components/FaceRecorder";

type UploadStatus = "idle" | "uploading" | "success" | "error";

// Point this at your external API endpoint
const EXTERNAL_UPLOAD_URL = "https://your-api.example.com/kyc/upload";

export default function KycPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    setUploadStatus("uploading");
    setUploadMessage("Uploading your video...");

    // try {
    //   const sessionId = crypto.randomUUID();
    //   const formData = new FormData();
    //   formData.append("video", blob, `${sessionId}.webm`);
    //   formData.append("sessionId", sessionId);

    //   const res = await fetch(EXTERNAL_UPLOAD_URL, {
    //     method: "POST",
    //     // If your external API needs auth, add headers here, e.g.:
    //     // headers: { Authorization: `Bearer ${YOUR_TOKEN}` },
    //     body: formData,
    //   });

    //   if (!res.ok) {
    //     throw new Error(`Upload failed with status ${res.status}`);
    //   }

    //   setUploadStatus("success");
    //   setUploadMessage("Verification video uploaded successfully.");
    // } catch (err) {
    //   console.error("Upload error:", err);
    //   setUploadStatus("error");
    //   setUploadMessage("Upload failed — please try again.");
    // }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-2">Identity Verification</h1>
        <p className="text-gray-500 text-sm">
          Position your face in the frame, then record a short video for
          verification.
        </p>
      </div>

      <FaceRecorder
        onRecordingComplete={handleRecordingComplete}
        maxDurationMs={10000}
      />

      {uploadStatus !== "idle" && (
        <div
          className={`text-sm px-4 py-2 rounded-md ${
            uploadStatus === "uploading"
              ? "bg-blue-50 text-blue-700"
              : uploadStatus === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {uploadMessage}
        </div>
      )}
    </main>
  );
}
