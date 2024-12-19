import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { type RenderImage } from '@/types/render';

interface ImageGalleryProps {
  images: RenderImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainRef, mainEmbla] = useEmblaCarousel({ loop: true });
  const [thumbsRef, thumbsEmbla] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const scrollPrev = () => {
    mainEmbla?.scrollPrev();
    thumbsEmbla?.scrollPrev();
  };

  const scrollNext = () => {
    mainEmbla?.scrollNext();
    thumbsEmbla?.scrollNext();
  };

  const onThumbClick = (index: number) => {
    if (!mainEmbla || !thumbsEmbla) return;
    mainEmbla.scrollTo(index);
    setSelectedIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div className="relative">
        <div ref={mainRef} className="overflow-hidden">
          <div className="flex">
            {images.map((image, index) => (
              <div key={index} className="relative flex-[0_0_100%] min-w-0">
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`Render view ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Thumbnails */}
      <div ref={thumbsRef} className="overflow-hidden">
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onThumbClick(index)}
              className={cn(
                "relative flex-[0_0_20%] min-w-0 aspect-square rounded-md overflow-hidden",
                "ring-2 ring-offset-2 transition-all",
                selectedIndex === index
                  ? "ring-primary"
                  : "ring-transparent hover:ring-primary/50"
              )}
            >
              <Image
                src={image.thumbnail ?? image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}