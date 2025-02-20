interface RenderSettingItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  type: 'select' | 'range';
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export default function RenderSettingItem({
  icon,
  label,
  value,
  onChange,
  type,
  options = [],
  min,
  max,
  step,
  disabled = false
}: RenderSettingItemProps) {
  return (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm">
        {type === 'select' ? (
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="border rounded px-2 py-1"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="range"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="w-24"
          />
        )}
      </div>
    </div>
  );
}