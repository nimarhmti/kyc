"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaceDetectionStatus } from "../face-api/kyc";
import { useFaceDetection } from "../face-api/hooks/useFaceDetection";

export interface FaceRecorderHandle {
  start: () => void;
  stop: () => void;
  getRecordedBlob: () => Blob | null;
  getRecordedUrl: () => string | null;
  isRecording: () => boolean;
  canRecord: () => boolean;
}

interface FaceRecorderProps {
  onRecordingComplete?: (blob: Blob, url: string | null) => void;
  onStatusChange?: (status: FaceDetectionStatus) => void;
  durationSeconds?: number; // default 15
  onPreviewReady?: (url: string | null) => void;
}

const STATUS_COLORS: Record<FaceDetectionStatus, string> = {
  loading: "#9ca3af",
  "no-face": "#ef4444",
  "off-center": "#f59e0b",
  centered: "#22c55e",
  error: "#ef4444",
};

// Formats seconds as MM:SS, e.g. 65 -> "01:05"
function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const FaceRecorder = forwardRef<FaceRecorderHandle, FaceRecorderProps>(
  function FaceRecorder(
    {
      onRecordingComplete,
      onStatusChange,
      onPreviewReady,
      durationSeconds = 15,
    },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const recordingStartTimeRef = useRef<number | null>(null);

    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const { status, box, message, modelsLoaded } = useFaceDetection(videoRef);

    // Let the parent know whenever detection status changes
    // (so an external button can enable/disable itself)
    useEffect(() => {
      onStatusChange?.(status);
    }, [status, onStatusChange]);

    // Build a stable blob URL once per new recording; revoke old ones to avoid leaks
    useEffect(() => {
      if (!recordedBlob) {
        setRecordedUrl(null);
        return;
      }
      const url = URL.createObjectURL(recordedBlob);
      setRecordedUrl(url);
      onPreviewReady?.(url);
      return () => URL.revokeObjectURL(url);
    }, [recordedBlob]);

    // Camera + mic setup
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

    // Draw the face bounding box on the canvas overlay
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

    const canRecordNow = useCallback(
      () => status === "centered" && modelsLoaded && !cameraError,
      [status, modelsLoaded, cameraError],
    );

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
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      setIsRecording(false);
    }, []);

    const startRecording = useCallback(() => {
      const stream = streamRef.current;
      if (!stream || !canRecordNow()) return;

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        onRecordingComplete?.(blob, recordedUrl);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordedBlob(null);
      setElapsedSeconds(0);
      recordingStartTimeRef.current = Date.now();

      // Tick every 250ms for a smooth progress border, but display rounds to whole seconds
      tickIntervalRef.current = setInterval(() => {
        if (!recordingStartTimeRef.current) return;
        const elapsedMs = Date.now() - recordingStartTimeRef.current;
        setElapsedSeconds(Math.min(elapsedMs / 1000, durationSeconds));
      }, 250);

      autoStopTimeoutRef.current = setTimeout(
        stopRecording,
        durationSeconds * 1000,
      );
    }, [canRecordNow, durationSeconds, onRecordingComplete, stopRecording]);

    // Expose the imperative API to whatever ref the parent attaches
    useImperativeHandle(
      ref,
      () => ({
        start: startRecording,
        stop: stopRecording,
        getRecordedBlob: () => recordedBlob,
        getRecordedUrl: () => recordedUrl,
        isRecording: () => isRecording,
        canRecord: canRecordNow,
      }),
      [
        startRecording,
        stopRecording,
        recordedBlob,
        recordedUrl,
        isRecording,
        canRecordNow,
      ],
    );

    // Progress ratio (0 to 1) for the border animation
    const progress = Math.min(elapsedSeconds / durationSeconds, 1);

    // SVG rect perimeter-based stroke-dasharray trick for a "filling" border
    const borderWidth = 640;
    const borderHeight = 480;
    const perimeter = 2 * (borderWidth + borderHeight);
    const dashOffset = perimeter * (1 - progress);

    return (
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative bg-black rounded-lg overflow-hidden"
          style={{ width: borderWidth, maxWidth: "100%", aspectRatio: "4/3" }}
        >
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

          {/* Progress border - fills around the video as recording proceeds */}
          {isRecording && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${borderWidth} ${borderHeight}`}
              preserveAspectRatio="none"
            >
              <rect
                x="2"
                y="2"
                width={borderWidth - 4}
                height={borderHeight - 4}
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeDasharray={perimeter}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.25s linear" }}
              />
            </svg>
          )}

          {isRecording && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {formatTime(elapsedSeconds)}/{formatTime(durationSeconds)}
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
      </div>
    );
  },
);

FaceRecorder.displayName = "FaceRecorder";
