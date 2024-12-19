import Image from "next/image";
import { type RenderImage } from "@/types/render";
import { cn } from "@/lib/utils";

interface MainImageProps {
  image: RenderImage;
  alt: string;
  className?: string;
}

export default function MainImage({ image, alt, className }: MainImageProps) {
  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <Image
        src={image.url}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-contain rounded-lg"
        priority
      />
    </div>
  );
}