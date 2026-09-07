"use client";

import {
  FaceRecorder,
  FaceRecorderHandle,
} from "@/module/face-api-v2/faceRecorder";
import { FaceDetectionStatus } from "@/module/face-api/kyc";
import { useRef, useState } from "react";

export default function KycPage() {
  const recorderRef = useRef<FaceRecorderHandle>(null);
  const [status, setStatus] = useState<FaceDetectionStatus>("loading");
  const [isRecording, setIsRecording] = useState(false);

  const handleStart = () => {
    recorderRef.current?.start();
    setIsRecording(true);
  };

  const handleStop = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
    console.log(recorderRef.current?.getRecordedUrl());
  };

  const handleUpload = async () => {
    const blob = recorderRef.current?.getRecordedBlob();
    if (!blob) return;

    const formData = new FormData();
    formData.append("video", blob, "kyc.webm");
    await fetch("https://your-api.com/kyc/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10  py-10">
      {isRecording + ""}
      {/* <FaceRecorder
        ref={recorderRef}
        onPreviewReady={(url) => {
          console.log({ urlllll: url });
        }}
        durationSeconds={15}
        onStatusChange={setStatus}
        onRecordingComplete={(blob, url) => {
          console.log({ blob, url });
          console.log(recorderRef.current?.getRecordedUrl());
        }}
      /> */}

      {/* <button
        onClick={handleStart}
        className="w-100 rounded-full border border-green-900 bg-green-100 text-green-800 py-2"
        disabled={status !== "centered" || isRecording}
      >
        Start
      </button>
      <button
        onClick={handleStop}
        disabled={!isRecording}
        className="w-100 rounded-full border border-red-900 text-red-800 bg-red-100  py-2"
      >
        Stop
      </button>
      <button
        onClick={handleUpload}
        className="w-100 rounded-full border border-blue-900 text-blue-800 bg-blue-200 py-2"
      >
        Upload
      </button> */}
    </div>
  );
}
