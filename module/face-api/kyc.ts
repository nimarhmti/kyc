export type FaceDetectionStatus =
  | "loading" // models still loading
  | "no-face" // no face detected in frame
  | "off-center" // face detected but not centered/well-positioned
  | "centered" // face detected and centered - good to record
  | "error"; // camera or model error

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  status: FaceDetectionStatus;
  box: FaceBox | null;
  message: string;
}

export interface KycUploadPayload {
  sessionId: string;
  recordedAt: string;
}

export interface KycUploadResponse {
  success: boolean;
  sessionId: string;
  message?: string;
}
