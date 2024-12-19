"use client";

import { useState, useEffect } from "react";
import { type RenderImage } from "@/types/render";
import { useQuery } from "@tanstack/react-query";

async function checkRendersExist(articleId: string) {
  const response = await fetch(`/api/render/check/${articleId}`);
  const data = await response.json();
  return data.exists;
}

export function useRenderImages(articleId: string) {
  const { data: exists, isLoading } = useQuery({
    queryKey: ["renders", articleId],
    queryFn: () => checkRendersExist(articleId),
    staleTime: 30000, // Cache for 30 seconds
    cacheTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  const images = exists 
    ? Array.from({ length: 5 }, (_, i) => ({
        url: `https://glb-render.s3.eu-north-1.amazonaws.com/renders/${articleId}-${i + 1}.jpg`,
      }))
    : null;

  return { images, isLoading };
}