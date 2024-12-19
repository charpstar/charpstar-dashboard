import Image from "next/image";
import { type RenderImage } from "@/types/render";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef } from "react";

interface ThumbnailStripProps {
  images: RenderImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ThumbnailStrip({
  images,
  selectedIndex,
  onSelect,
}: ThumbnailStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 200; // Adjust as needed
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-8 scrollbar-hide snap-x snap-mandatory"
      >
        {images.map((image, index) => (
          <button
            key={image.url}
            onClick={() => onSelect(index)}
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

      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}