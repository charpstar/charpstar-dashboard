"use client";

import { useState } from "react";
import { type RenderImage } from "@/types/render";
import MainImage from "./MainImage";
import ThumbnailStrip from "./ThumbnailStrip";
import { Card, CardContent } from "@/components/ui/card";

export default function RenderGallery({ images }: { images: RenderImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images.length) {
    return null;
  }

  // Ensure we have a valid selected index
  const currentIndex = Math.min(selectedIndex, images.length - 1);
  const selectedImage = images[currentIndex];

  if (!selectedImage) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <MainImage
          image={selectedImage}
          alt={`Render view ${currentIndex + 1}`}
        />
        <ThumbnailStrip
          images={images}
          selectedIndex={currentIndex}
          onSelect={setSelectedIndex}
        />
      </CardContent>
    </Card>
  );
}