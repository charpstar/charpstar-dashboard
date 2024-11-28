import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NoData() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-center">No Data Available</CardTitle>
          <CardDescription className="text-center">
            Your dataset is not properly linked or configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Please contact your administrator to ensure your account is properly set up with the required data access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}