"use client";

import { useState } from "react";
import { useRenderStatus } from "@/hooks/useRenderStatus";
import { useRenderImages } from "@/hooks/useRenderImages";
import { useProducts } from "@/hooks/useProducts";
import RenderGrid from "./gallery/RenderGrid";
import RenderSettings from "./settings/RenderSettings";
import RenderProgress from "./progress/RenderProgress";
import ProductDetails from "./details/ProductDetails";
import JSZip from "jszip";
import { getGlbUrl } from "@/config/glbUrls";

export default function RenderViewer({ articleId }: { articleId: string }) {
  const [isRendering, setIsRendering] = useState(false);
  const { status, progress, jobId, setJobId, showRenderButton } = useRenderStatus(articleId, isRendering);
  const { images, isLoading: isLoadingImages } = useRenderImages(articleId);
  const { products } = useProducts();
  const product = products.find(p => p.articleID === articleId);

  const handleRender = async () => {
    try {
      setIsRendering(true);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Get the company name from the product link
      const companyName = product.productLink.includes('soffadirekt.se') ? 'SoffaDirekt' :
                         product.productLink.includes('kajakk-fritid.no') ? 'Kajakk-Fritid' :
                         'SharkGaming';

      const glbUrl = getGlbUrl(companyName, articleId);
      console.log(`Fetching GLB from: ${glbUrl}`);
      
      // Simple fetch without custom headers
      const response = await fetch(glbUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch GLB file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log(`GLB file size: ${blob.size} bytes`);
      
      // Validate file
      if (blob.size === 0) {
        throw new Error('GLB file is empty');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', blob, `${articleId}.glb`);
      formData.append('articleId', articleId);

      console.log('Starting render process...');
      const renderResponse = await fetch('/api/render/start', {
        method: 'POST',
        body: formData,
      });

      if (!renderResponse.ok) {
        const error = await renderResponse.json();
        throw new Error(error.error || 'Failed to start render job');
      }

      const data = await renderResponse.json();
      console.log('Render job started:', data.jobId);
      setJobId(data.jobId);
    } catch (error) {
      console.error('Error in render process:', error);
      setIsRendering(false);
      alert(error instanceof Error ? error.message : 'Failed to start render process');
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