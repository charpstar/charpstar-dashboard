import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type RenderStatus } from "@/types/render";

interface RenderProgressProps {
  progress: number;
  status: RenderStatus;
  jobId: string | null;
}

const statusMessages = {
  idle: "Waiting to start...",
  uploading: "Uploading model...",
  processing: "Processing renders...",
  complete: "Renders complete!",
  error: "Error processing renders",
};

export default function RenderProgress({ progress, status, jobId }: RenderProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Render Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <div className="text-sm text-muted-foreground">
          {statusMessages[status]}
          {jobId && <div className="text-xs mt-1">Job ID: {jobId}</div>}
        </div>
      </CardContent>
    </Card>
  );
}