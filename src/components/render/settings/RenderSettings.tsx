import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Download } from "lucide-react";
import RenderSettingItem from "./RenderSettingItem";

interface RenderSettingsProps {
  onRender: (settings: RenderSettings) => void;
  onDownloadAll: () => void;
  isRendering: boolean;
  hasImages: boolean;
  showRenderButton: boolean;
}

interface RenderSettings {
  margin: number;
  backgroundColor: string;
  resolution: string;
  imageFormat: string;
}

export default function RenderSettings({
  onRender,
  onDownloadAll,
  isRendering,
  hasImages,
  showRenderButton
}: RenderSettingsProps) {
  const [settings, setSettings] = useState<RenderSettings>({
    margin: 50,
    backgroundColor: "1,1,1",
    resolution: "1920x1080",
    imageFormat: "JPEG"
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Render Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">          
          <RenderSettingItem
            icon={<Settings className="h-4 w-4" />}
            label="Render Image Margin"
            value={settings.margin}
            onChange={(value) => setSettings(prev => ({ ...prev, margin: value }))}
            type="range"
            min={10}
            max={90}
            step={10}
            disabled={isRendering}
          />
          
          <RenderSettingItem
            icon={<Settings className="h-4 w-4" />}
            label="Background Color"
            value={settings.backgroundColor}
            onChange={(value) => setSettings(prev => ({ ...prev, backgroundColor: value }))}
            type="select"
            options={[
              { label: "White", value: "1,1,1" },
              { label: "Black", value: "0,0,0" },
              { label: "Grey", value: "0.5,0.5,0.5" }
            ]}
            disabled={isRendering}
          />

          <RenderSettingItem
            icon={<Settings className="h-4 w-4" />}
            label="Resolution"
            value={settings.resolution}
            onChange={(value) => setSettings(prev => ({ ...prev, resolution: value }))}
            type="select"
            options={[
              { label: "1920x1080", value: "1920x1080" },
              { label: "1500x1500", value: "1500x1500" }
            ]}
            disabled={isRendering}
          />

          <RenderSettingItem
            icon={<Settings className="h-4 w-4" />}
            label="Image Format"
            value={settings.imageFormat}
            onChange={(value) => setSettings(prev => ({ ...prev, imageFormat: value }))}
            type="select"
            options={[
              { label: "JPEG", value: "JPEG" },
              { label: "PNG", value: "PNG" }
            ]}
            disabled={isRendering}
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
              onClick={() => onRender(settings)}
              disabled={isRendering}
            >
              {isRendering ? "Rendering..." : "Start Rendering"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}