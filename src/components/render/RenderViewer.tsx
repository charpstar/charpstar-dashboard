"use client";

import { useState, useEffect } from "react";
import { useRenderStatus } from "@/hooks/useRenderStatus";
import { useRenderImages } from "@/hooks/useRenderImages";
import { useProducts } from "@/hooks/useProducts";
import RenderGrid from "./gallery/RenderGrid";
import RenderSettings from "./settings/RenderSettings";
import RenderProgress from "./progress/RenderProgress";
import ProductDetails from "./details/ProductDetails";
import { startRender } from "@/lib/render/actions";
import JSZip from "jszip";

export default function RenderViewer({ articleId }: { articleId: string }) {
  const [isRendering, setIsRendering] = useState(false);
  const { status, progress, jobId, setJobId, showRenderButton } = useRenderStatus(articleId, isRendering);
  const { images, isLoading: isLoadingImages } = useRenderImages(articleId);
  const { products } = useProducts();
  const product = products.find(p => p.articleID === articleId);
  
  const [settings] = useState({
    resolution: "1920x1080",
    sampleMultiplier: "1x",
    maxTime: "24"
  });

  useEffect(() => {
    if (jobId) {
      setIsRendering(true);
    }
  }, [jobId]);

  const handleRender = async () => {
    try {
      setIsRendering(true);
      const newJobId = await startRender(articleId);
      setJobId(newJobId);
    } catch (error) {
      console.error("Failed to start render:", error);
      setIsRendering(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!images) return;

    try {
      const zip = new JSZip();
      
      // Download all images
      const imagePromises = images.map(async (image, index) => {
        const response = await fetch(image.url);
        const blob = await response.blob();
        zip.file(`${articleId}-${index + 1}.jpg`, blob);
      });

      await Promise.all(imagePromises);

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${articleId}-renders.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download renders:", error);
    }
  };

  if (isLoadingImages || !product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-6 grid-cols-12">
      <div className="col-span-8">
        <RenderGrid images={images} />
      </div>

      <div className="col-span-4 space-y-6">
        <ProductDetails 
          name={product.name}
          articleId={product.articleID}
          productLink={product.productLink}
        />

        <RenderSettings 
          settings={settings}
          onRender={handleRender}
          onDownloadAll={handleDownloadAll}
          isRendering={isRendering}
          hasImages={!!images}
          showRenderButton={showRenderButton}
        />

        {isRendering && (
          <RenderProgress 
            progress={progress} 
            status={status} 
            jobId={jobId}
          />
        )}
      </div>
    </div>
  );
}