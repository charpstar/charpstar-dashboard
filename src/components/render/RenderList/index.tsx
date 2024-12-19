"use client";

import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import RenderListGrid from "./RenderListGrid";
import { Search } from "lucide-react";

export default function RenderList() {
  const { products, isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.articleID.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-20 w-full animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!products.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No products found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <RenderListGrid products={filteredProducts} />
    </div>
  );
}