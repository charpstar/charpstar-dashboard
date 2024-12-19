// New file to centralize render status logic
import { type JobProgress } from "@/types/render";

export function isJobActive(job: JobProgress): boolean {
  return !(
    job.status === 'COMPLETED' || 
    job.status === 'FAILED' || 
    job.status === 'ERROR' ||
    job.modelStatus === 'FAILED' ||
    job.modelStatus === 'COMPLETED'
  );
}

export function isJobComplete(job: JobProgress): boolean {
  return job.status === 'COMPLETED' || job.modelStatus === 'COMPLETED';
}

export function isJobFailed(job: JobProgress): boolean {
  return (
    job.status === 'FAILED' || 
    job.status === 'ERROR' || 
    job.modelStatus === 'FAILED'
  );
}