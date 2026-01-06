import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeCardProps {
  icon: string;
  label: string;
  subtitle?: string;
  description: string;
  features?: string[];
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

export function ModeCard({
  icon,
  label,
  subtitle,
  description,
  features,
  selected,
  onToggle,
  className,
}: ModeCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        "relative w-full p-5 rounded-xl border-2 text-left transition-all",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 shadow-lg"
          : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
        className
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground">{label}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground italic">{subtitle}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{description}</p>

      {features && features.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
            What changes:
          </p>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <p className="text-xs text-primary font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Active — changes applied site-wide
          </p>
        </div>
      )}
    </motion.button>
  );
}
