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
  progress: number;
  status: 'PENDING' | 'RUNNING' | 'FAILED' | 'ERROR' | 'COMPLETED';
  modelStatus: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
}