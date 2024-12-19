import { Suspense } from "react";
import RenderViewer from "@/components/render/RenderViewer";
import RenderViewerSkeleton from "@/components/render/RenderViewerSkeleton";

export default function RenderPage({
  params,
}: {
  params: { articleId: string };
}) {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Renders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and manage product renders
          </p>
        </div>
      </div>

      <Suspense fallback={<RenderViewerSkeleton />}>
        <RenderViewer articleId={params.articleId} />
      </Suspense>
    </div>
  );
}