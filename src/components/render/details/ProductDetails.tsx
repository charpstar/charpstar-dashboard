import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductDetailsProps {
  name: string;
  articleId: string;
  productLink: string;
}

export default function ProductDetails({ name, articleId, productLink }: ProductDetailsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Article ID: {articleId}</p>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open(productLink, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Product Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}