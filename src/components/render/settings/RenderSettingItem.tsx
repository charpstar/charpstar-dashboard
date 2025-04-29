import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface SelectOption {
  label: string;
  value: string;
}

interface RenderSettingItemProps {
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
  value: number | string;
  onChange: (value: number | string) => void;
  type: 'select' | 'range' | 'color';
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function RenderSettingItem({
  icon,
  label,
  tooltip,
  value,
  onChange,
  type,
  options = [],
  min,
  max,
  step,
  disabled = false
}: RenderSettingItemProps) {
  const renderControl = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            value={value.toString()}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'range':
        return (
          <div className="flex items-center gap-4 w-full">
            <Slider
              value={[Number(value)]}
              min={min}
              max={max}
              step={step}
              onValueChange={(vals) => onChange(vals[0] ?? Number(value))}
              disabled={disabled}
              className="flex-1"
            />
            <span className="text-sm font-medium tabular-nums w-12 text-right">
              {value}%
            </span>
          </div>
        );

      case 'color':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg border shadow-sm cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: value.toString() }}
              />
              <Input
                type="text"
                value={value.toString()}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.startsWith('#')) {
                    onChange(newValue);
                  } else if (newValue === '') {
                    onChange('#');
                  } else {
                    onChange('#' + newValue);
                  }
                }}
                disabled={disabled}
                className="w-[120px] font-mono text-sm"
                placeholder="#FFFFFF"
                maxLength={7}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {options.map((color) => (
                <button
                  key={color.value}
                  className={cn(
                    "group relative h-12 w-full rounded-lg border shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    value === color.value && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => onChange(color.value)}
                >
                  <span className="sr-only">{color.label}</span>
                  <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow group-hover:opacity-100">
                    {color.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-2", disabled && "opacity-50")}>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="flex-1">
          <Label className="text-sm font-medium">
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 inline-block h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right" align="start">
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className="pl-11">
        {renderControl()}
      </div>
    </div>
  );
}