import { useRenderImages } from "@/hooks/useRenderImages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type Product } from "@/types/product";

export default function RenderListItem({ product }: { product: Product }) {
  const { images, isLoading } = useRenderImages(product.articleID);
  const thumbnailUrl = images?.[0]?.url ?? "/placeholder-product.jpg";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 flex-shrink-0">
            <Image
              src={thumbnailUrl}
              alt={product.name}
              className="rounded-md object-cover"
              fill
              sizes="80px"
            />
          </div>

          <div className="flex-grow">
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.articleID}</p>
            <a 
              href={product.productLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View Product
            </a>
          </div>

          <div className="flex-shrink-0">
            <Link href={`/render/${product.articleID}`}>
              <Button>
                <Eye className="mr-2 h-4 w-4" />
                View Model
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}