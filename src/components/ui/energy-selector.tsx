import * as React from "react";
import { cn } from "@/lib/utils";
import { Battery, BatteryMedium, BatteryFull } from "lucide-react";

type EnergyLevel = 'low' | 'normal' | 'high';

interface EnergySelectorProps {
  value: EnergyLevel;
  onChange: (level: EnergyLevel) => void;
  className?: string;
}

const energyOptions: { value: EnergyLevel; label: string; icon: React.ReactNode; color: string }[] = [
  { 
    value: 'low', 
    label: 'Low', 
    icon: <Battery className="w-5 h-5" />,
    color: 'text-warning',
  },
  { 
    value: 'normal', 
    label: 'Normal', 
    icon: <BatteryMedium className="w-5 h-5" />,
    color: 'text-primary',
  },
  { 
    value: 'high', 
    label: 'High', 
    icon: <BatteryFull className="w-5 h-5" />,
    color: 'text-success',
  },
];

export function EnergySelector({ value, onChange, className }: EnergySelectorProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {energyOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
            "hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            value === option.value
              ? "border-primary bg-primary/10"
              : "border-border bg-card"
          )}
        >
          <span className={cn(option.color)}>{option.icon}</span>
          <span className="text-sm font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
