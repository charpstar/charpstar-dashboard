"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function RenderViewerSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="aspect-square w-full bg-muted rounded-lg animate-pulse" />
            <div className="flex gap-2 px-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 w-20 aspect-square rounded-md bg-muted animate-pulse"
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="h-10 w-full bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}