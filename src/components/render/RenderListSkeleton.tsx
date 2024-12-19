"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function RenderListSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-md bg-muted animate-pulse" />
              <div className="flex-grow space-y-2">
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex-shrink-0">
                <div className="h-10 w-28 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}