import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Download } from "lucide-react";
import RenderSettingItem from "./RenderSettingItem";

interface RenderSettingsProps {
  onRender: () => void;
  onDownloadAll: () => void;
  isRendering: boolean;
  hasImages: boolean;
  showRenderButton: boolean;
}

export default function RenderSettings({
  onRender,
  onDownloadAll,
  isRendering,
  hasImages,
  showRenderButton
}: RenderSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Render Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Note: Settings customization is currently disabled. Default settings will be used.
          </div>
          
          <RenderSettingItem
            icon={<Settings className="h-4 w-4" />}
            label="Render Image Margin"
            value="50%"
            disabled={true}
          />
          
          <RenderSettingItem
            icon={<Settings className="h-4 w-4" />}
            label="Render Image Background"
            value="White"
            disabled={true}
          />
        </div>

        <div className="space-y-3">
          {hasImages && (
            <Button 
              className="w-full" 
              variant="outline"
              onClick={onDownloadAll}
            >
              <Download className="mr-2 h-4 w-4" />
              Download all
            </Button>
          )}

          {showRenderButton && (
            <Button 
              className="w-full" 
              onClick={onRender}
              disabled={isRendering}
            >
              {isRendering ? "Rendering..." : "Start Rendering"}
            </Button>
          )}
        </div>

        {isRendering && (
          <p className="text-sm text-muted-foreground text-center">
            Rendering in progress...
          </p>
        )}
      </CardContent>
    </Card>
  );
}