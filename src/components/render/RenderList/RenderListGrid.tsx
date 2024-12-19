import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { type Product } from "@/types/product";
import { useRenderImages } from "@/hooks/useRenderImages";
import { memo } from "react";

const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { images } = useRenderImages(product.articleID);
  const thumbnailUrl = images?.[0]?.url ?? "/500x500.png";

  return (
    <Link href={`/render/${product.articleID}`} className="block group">
      <Card className="group hover:bg-accent/50 transition-colors h-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={thumbnailUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(min-width: 1536px) 12.5vw, (min-width: 1280px) 14.28vw, (min-width: 1024px) 16.66vw, (min-width: 768px) 20vw, 25vw"
                loading="lazy"
                unoptimized={thumbnailUrl.startsWith("https://glb-render.s3")}
              />
            </div>
            
            {/* Text Content */}
            <div className="space-y-1 px-0.5">
              <h3 
                className="font-medium text-sm leading-tight truncate" 
                title={product.name}
              >
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {product.articleID}
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-1">
              <Button 
                className="w-full h-8 text-sm font-medium"
                size="sm"
              >
                View Renders
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-7 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(product.productLink, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Product Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

export default function RenderListGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-5">
      {products.map((product) => (
        <ProductCard key={product.articleID} product={product} />
      ))}
    </div>
  );
}