import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { type RenderImage } from "@/types/render";

interface RenderGridProps {
  images: RenderImage[] | null;
}

export default function RenderGrid({ images }: RenderGridProps) {
  const renderImages = images || Array(5).fill({ url: "/500x500.png" });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Main large image */}
          <div className="col-span-6 relative aspect-square">
            <Image
              src={renderImages[0]?.url}
              alt="Main render view"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          {/* Middle column - 2 images */}
          <div className="col-span-3 space-y-4">
            <div className="relative aspect-square">
              <Image
                src={renderImages[1]?.url}
                alt="Render view 2"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src={renderImages[2]?.url}
                alt="Render view 3"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Right column - 2 images */}
          <div className="col-span-3 space-y-4">
            <div className="relative aspect-square">
              <Image
                src={renderImages[3]?.url}
                alt="Render view 4"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src={renderImages[4]?.url}
                alt="Render view 5"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}