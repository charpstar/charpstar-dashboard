interface RenderSettingItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export default function RenderSettingItem({
  icon,
  label,
  value,
  description,
  disabled = false
}: RenderSettingItemProps) {
  return (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm">
        {value}
        {description && (
          <span className="text-muted-foreground ml-1">{description}</span>
        )}
      </div>
    </div>
  );
}