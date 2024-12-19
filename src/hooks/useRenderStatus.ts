"use client";

import { useState, useEffect } from "react";
import { type RenderStatus } from "@/types/render";
import { useRenderImages } from "./useRenderImages";

const STORAGE_PREFIX = "render_job_";

export function useRenderStatus(articleId: string, isRendering: boolean) {
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const { images, isLoading: isLoadingImages } = useRenderImages(articleId);

  // Check for existing job on mount
  useEffect(() => {
    const checkExistingJob = async () => {
      try {
        const response = await fetch(`/api/get-jobid-by-articleid?articleID=${articleId}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.jobId) {
          setJobId(data.jobId);
          setStatus("processing");
        }
      } catch (error) {
        console.error("Failed to check existing job:", error);
      }
    };

    if (!images) {
      void checkExistingJob();
    }
  }, [articleId, images]);

  // Poll job progress
  useEffect(() => {
    if (!jobId) return;

    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/render/progress/${jobId}`);
        if (!response.ok) return;
        const data = await response.json();

        setProgress(data.progress || 0);
        
        if (data.status === "COMPLETED" || data.modelStatus === "COMPLETED") {
          setJobId(null);
          setStatus("complete");
        } else if (data.status === "FAILED" || data.status === "ERROR" || data.modelStatus === "FAILED") {
          setJobId(null);
          setStatus("error");
        }
      } catch (error) {
        console.error("Error checking progress:", error);
      }
    };

    const interval = setInterval(checkProgress, 1000);
    return () => clearInterval(interval);
  }, [jobId]);

  // Update status based on current state
  useEffect(() => {
    if (isLoadingImages) {
      return;
    }
    
    if (images) {
      setStatus("complete");
      setProgress(100);
    } else if (isRendering && !jobId) {
      setStatus("processing");
      setProgress(0);
    } else if (!jobId && !isRendering) {
      setStatus("idle");
      setProgress(0);
    }
  }, [images, isRendering, jobId, isLoadingImages]);

  const showRenderButton = !isLoadingImages && !jobId && (!images || status === "complete");

  return {
    status,
    progress,
    jobId,
    setJobId,
    showRenderButton
  };
}