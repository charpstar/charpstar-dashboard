"use client";

import { useState } from "react";
import { useRenderStatus } from "@/hooks/useRenderStatus";
import { useRenderImages } from "@/hooks/useRenderImages";
import { useProducts } from "@/hooks/useProducts";
import RenderGrid from "./gallery/RenderGrid";
import { type RenderSettings as RenderSettingsType } from "@/types/render";
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

const handleRender = async (settings: RenderSettings) => {
    try {
      setIsRendering(true);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const companyName = product.productLink.includes('soffadirekt.se') ? 'SoffaDirekt' :
                         product.productLink.includes('kajakk-fritid.no') ? 'Kajakk-Fritid' :
                         'SharkGaming';

      const glbUrl = getGlbUrl(companyName, articleId);
      console.log(`Fetching GLB from: ${glbUrl}`);
      
      const response = await fetch(glbUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch GLB file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log(`GLB file size: ${blob.size} bytes`);
      
      if (blob.size === 0) {
        throw new Error('GLB file is empty');
      }

      // Get signed URL for upload
      const urlResponse = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { signedUrl } = await urlResponse.json();

      // Upload directly to S3
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'model/gltf-binary',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // Start render job with settings
      const renderResponse = await fetch('/api/render/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          articleId,
          renderSettings: settings // Pass the settings object
        }),
      });

      if (!renderResponse.ok) {
        const responseText = await renderResponse.text();
        console.log('Error response text:', responseText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.details || 'Unknown error';
        } catch (e) {
          errorMessage = `Failed to parse error response: ${responseText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await renderResponse.json();
      console.log('Render job started:', data);
      setJobId(data.jobId);
    } catch (error) {
      console.error('Detailed error in render process:', error);
      setIsRendering(false);
      alert(error instanceof Error ? error.message : 'Failed to start render process');
    }
};

  const handleDownloadAll = async () => {
      if (!images) return;

      try {
          const zip = new JSZip();
          
          const imagePromises = images.map(async (image, index) => {
              const response = await fetch('/api/proxy-image', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ url: image.url }),
              });
              
              if (!response.ok) {
                  throw new Error(`Failed to fetch image ${index + 1}`);
              }
              
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
          alert('Failed to download images. Please try again.');
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
          onRender={handleRender} // This now expects a settings parameter
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