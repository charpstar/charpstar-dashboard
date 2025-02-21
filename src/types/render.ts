// src/types/render.ts
export type RenderStatus = 
  | "idle" 
  | "uploading" 
  | "processing" 
  | "complete" 
  | "error";

export interface RenderImage {
  url: string;
  thumbnail?: string;
}

export interface JobProgress {
  jobId: string;
  articleID: string;
  progress: number;
  status: 'PENDING' | 'RUNNING' | 'FAILED' | 'ERROR' | 'COMPLETED';
  modelStatus: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
}

export interface RenderSettings {
  margin: number;
  backgroundColor: string;
  resolution: string;
  imageFormat: string;
}