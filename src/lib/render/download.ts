"use server";

import JSZip from "jszip";

export async function downloadRenderImages(imageUrls: string[], articleId: string) {
  const zip = new JSZip();

  try {
    // Download all images and add them to the zip
    const imagePromises = imageUrls.map(async (url, index) => {
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(`${articleId}-${index + 1}.jpg`, blob);
    });

    await Promise.all(imagePromises);

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" });
    
    return content;
  } catch (error) {
    console.error("Error creating zip file:", error);
    throw error;
  }
}