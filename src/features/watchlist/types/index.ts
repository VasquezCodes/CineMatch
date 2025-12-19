export interface UploadWatchlistResult {
  success: boolean;
  fileName?: string;
  error?: string;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error";

