import { useState } from 'react';
import Image from 'next/image';
import { type RenderImage } from '@/types/render';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: RenderImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  if (!selectedImage) return null;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square">
        <Image
          src={selectedImage.url}
          alt={`Render view ${selectedIndex + 1}`}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative flex-shrink-0 w-20 aspect-square rounded-md overflow-hidden",
              "ring-2 ring-offset-2 transition-all snap-start",
              selectedIndex === index
                ? "ring-primary"
                : "ring-transparent hover:ring-primary/50"
            )}
          >
            <Image
              src={image.thumbnail ?? image.url}
              alt={`Thumbnail ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}