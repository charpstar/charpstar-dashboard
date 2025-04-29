import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paintbrush, Maximize, FileType, Download, Settings2 } from "lucide-react";
import RenderSettingItem from "./RenderSettingItem";
import { type RenderSettings } from "@/types/render";
import { Separator } from "@/components/ui/separator";

interface RenderSettingsProps {
  onRender: (settings: RenderSettings) => void;
  onDownloadAll: () => void;
  isRendering: boolean;
  hasImages: boolean;
  showRenderButton: boolean;
}

const predefinedColors = [
  { label: "White", value: "#FFFFFF" },
  { label: "Off White", value: "#FAF9F6" },
  { label: "Light Gray", value: "#E5E5E5" },
  { label: "Cool Gray", value: "#D3D3D3" },
  { label: "Dark Gray", value: "#4A4A4A" },
  { label: "Charcoal", value: "#36454F" },
  { label: "Warm White", value: "#F5F5DC" },
  { label: "Black", value: "#000000" },
];

export default function RenderSettings({
  onRender,
  onDownloadAll,
  isRendering,
  hasImages,
  showRenderButton
}: RenderSettingsProps) {
  const [settings, setSettings] = useState<RenderSettings>({
    margin: 75,
    backgroundColor: "#FFFFFF",
    resolution: "1920x1080",
    imageFormat: "JPEG"
  });

  const handleColorChange = (value: string | number) => {
    // Only process if the value is a string
    if (typeof value !== 'string') return;
    
    // Validate hex color
    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(value);
    if (!isValidHex) return;

    setSettings(prev => ({ 
      ...prev, 
      backgroundColor: value
    }));
  };

const handleRenderClick = () => {
  // Convert hex to RGB before sending to API
  const hex = settings.backgroundColor.replace('#', '');
  
  // Use Number.prototype.toFixed(6) to control precision
  const r = (parseInt(hex.substring(0, 2), 16) / 255).toFixed(6);
  const g = (parseInt(hex.substring(2, 4), 16) / 255).toFixed(6);
  const b = (parseInt(hex.substring(4, 6), 16) / 255).toFixed(6);

  const apiSettings = {
    ...settings,
    backgroundColor: `${r},${g},${b}`
  };

  onRender(apiSettings);
};

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Settings2 className="h-5 w-5" />
          Render Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 py-4">
          <div className="space-y-6">          
            <RenderSettingItem
              icon={<Maximize className="h-4 w-4" />}
              label="Margin"
              tooltip="Adjust the space around the rendered object"
              value={settings.margin}
              onChange={(value) => setSettings(prev => ({ 
                ...prev, 
                margin: typeof value === 'string' ? parseInt(value, 10) : value 
              }))}
              type="range"
              min={60}
              max={90}
              step={5}
              disabled={isRendering}
            />
            
            <RenderSettingItem
              icon={<Paintbrush className="h-4 w-4" />}
              label="Background Color"
              tooltip="Choose a background color or enter a hex code"
              value={settings.backgroundColor}
              onChange={handleColorChange}
              type="color"
              options={predefinedColors}
              disabled={isRendering}
            />

            <Separator className="my-6" />

            <RenderSettingItem
              icon={<Maximize className="h-4 w-4" />}
              label="Resolution"
              tooltip="Select the output resolution"
              value={settings.resolution}
              onChange={(value) => setSettings(prev => ({ 
                ...prev, 
                resolution: String(value) 
              }))}
              type="select"
              options={[
                { label: "1920×1080 (FHD)", value: "1920x1080" },
                { label: "1500×1500 (Square)", value: "1500x1500" }
              ]}
              disabled={isRendering}
            />

            <RenderSettingItem
              icon={<FileType className="h-4 w-4" />}
              label="Image Format"
              tooltip="Choose the output image format"
              value={settings.imageFormat}
              onChange={(value) => setSettings(prev => ({ 
                ...prev, 
                imageFormat: String(value) 
              }))}
              type="select"
              options={[
                { label: "JPEG (Smaller size)", value: "JPEG" },
                { label: "PNG (Better quality)", value: "PNG" }
              ]}
              disabled={isRendering}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            {hasImages && (
              <Button 
                variant="outline"
                onClick={onDownloadAll}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download all renders
              </Button>
            )}
            {showRenderButton && (
              <Button 
                onClick={handleRenderClick}
                disabled={isRendering}
                className="w-full"
              >
                {isRendering ? "Rendering..." : "Start Rendering"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}