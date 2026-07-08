"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaceDetectionStatus } from "./kyc";
import { useFaceDetection } from "./hooks/useFaceDetection";
import VID from "./VID";
// import {} from "./hooks";
// import { useFaceDetection } from "@/hooks/useFaceDetection";
// import { FaceDetectionStatus } from "@/types/kyc";

interface FaceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDurationMs?: number; // optional auto-stop after N ms
}

const STATUS_COLORS: Record<FaceDetectionStatus, string> = {
  loading: "#9ca3af", // gray
  "no-face": "#ef4444", // red
  "off-center": "#f59e0b", // amber
  centered: "#22c55e", // green
  error: "#ef4444",
};

export default function FaceRecorder({
  onRecordingComplete,
  maxDurationMs,
}: FaceRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const { status, box, message, modelsLoaded } = useFaceDetection(videoRef);

  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // Create the blob URL exactly once per new recording, and clean it up properly
  useEffect(() => {
    if (!recordedBlob) {
      setRecordedUrl(null);
      return;
    }
    const url = URL.createObjectURL(recordedBlob);
    setRecordedUrl(url);
    return () => URL.revokeObjectURL(url); // prevent memory leaks
  }, [recordedBlob]);

  // Set up camera stream
  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError(
          "Camera access denied or unavailable. Please allow camera permissions.",
        );
        console.error("Camera error:", err);
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Draw bounding box + status overlay on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (box) {
      ctx.strokeStyle = STATUS_COLORS[status];
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
  }, [box, status]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      onRecordingComplete(blob);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setRecordedBlob(null);

    if (maxDurationMs) {
      autoStopTimeoutRef.current = setTimeout(stopRecording, maxDurationMs);
    }
  }, [maxDurationMs, onRecordingComplete, stopRecording]);

  const canRecord = status === "centered" && modelsLoaded && !cameraError;

  //   console.log("render");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[640px] max-w-full aspect-[4/3] bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full -scale-x-100"
        />
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording
          </div>
        )}
      </div>

      <div
        className="text-sm font-medium px-4 py-2 rounded-full"
        style={{
          color: STATUS_COLORS[status],
          border: `1px solid ${STATUS_COLORS[status]}`,
        }}
      >
        {cameraError ?? message}
      </div>

      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!canRecord}
            className="px-5 py-2 rounded-md bg-green-600 text-white font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-5 py-2 rounded-md bg-red-600 text-white font-medium"
          >
            Stop Recording
          </button>
        )}
      </div>

      {recordedUrl && !isRecording && (
        <video
          src={recordedUrl}
          controls
          className="w-[320px] rounded-md border"
        />
      )}
    </div>
  );
}
