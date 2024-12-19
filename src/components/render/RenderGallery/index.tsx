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

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <MainImage
          image={images[selectedIndex]}
          alt={`Render view ${selectedIndex + 1}`}
        />
        <ThumbnailStrip
          images={images}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </CardContent>
    </Card>
  );
}