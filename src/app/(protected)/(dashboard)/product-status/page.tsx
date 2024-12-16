"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function ProductStatusPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Status Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage your product pipeline
          </p>
        </div>
      </div>

      <Card className="flex items-center justify-center min-h-[400px]">
        <CardContent className="text-center p-8">
          <Construction className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            We&apos;re developing a comprehensive product status control system. 
            This feature will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}   