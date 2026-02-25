import type { LucideIcon } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border-none">
    {Icon && (
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <Icon size={40} />
      </div>
    )}
    <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
    {description && (
      <p className="text-muted-foreground mt-2 max-w-sm">{description}</p>
    )}
  </div>
);
