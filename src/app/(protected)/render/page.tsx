import { Suspense } from "react";
import RenderList from "@/components/render/RenderList";
import RenderListSkeleton from "@/components/render/RenderListSkeleton";

export default function RenderPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">3D Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage renders for your 3D products
          </p>
        </div>
      </div>

      <Suspense fallback={<RenderListSkeleton />}>
        <RenderList />
      </Suspense>
    </div>
  );
}