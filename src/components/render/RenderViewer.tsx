"use client";

import { useState, useEffect } from "react";
import { useRenderStatus } from "@/hooks/useRenderStatus";
import { useRenderImages } from "@/hooks/useRenderImages";
import { useProducts } from "@/hooks/useProducts";
import RenderGrid from "./gallery/RenderGrid";
import RenderSettings from "./settings/RenderSettings";
import RenderProgress from "./progress/RenderProgress";
import ProductDetails from "./details/ProductDetails";
import JSZip from "jszip";

export default function RenderViewer({ articleId }: { articleId: string }) {
  const [isRendering, setIsRendering] = useState(false);
  const { status, progress, jobId, setJobId, showRenderButton } = useRenderStatus(articleId, isRendering);
  const { images, isLoading: isLoadingImages } = useRenderImages(articleId);
  const { products } = useProducts();
  const product = products.find(p => p.articleID === articleId);

  const handleRender = async () => {
    try {
      setIsRendering(true);
      const response = await fetch(`https://cdn.charpstar.net/SharkGaming/Android/${articleId}.glb`);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, `${articleId}.glb`);
  
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (uploadResponse.ok) {
        setJobId(uploadData.jobId);
      } else {
        console.error('Error uploading file:', uploadData.error);
        setIsRendering(false);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      setIsRendering(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!images) return;

    try {
      const zip = new JSZip();
      
      const imagePromises = images.map(async (image, index) => {
        const response = await fetch(image.url);
        const blob = await response.blob();
        zip.file(`${articleId}-${index + 1}.jpg`, blob);
      });

      await Promise.all(imagePromises);
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
          onRender={handleRender}
          onDownloadAll={handleDownloadAll}
          isRendering={isRendering}
          hasImages={!!images}
          showRenderButton={showRenderButton}
        />

        {(isRendering || jobId) && (
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