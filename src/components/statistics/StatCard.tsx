import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  subtitle,
  className 
}: StatCardProps) => {
  return (
    <Card className={cn("p-6 bg-gradient-to-br from-card to-card/50", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Icon className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <h3 className="text-3xl font-orbitron font-bold text-gradient mb-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={cn(
            "text-sm font-semibold px-2 py-1 rounded",
            trend.isPositive 
              ? "text-green-500 bg-green-500/10" 
              : "text-red-500 bg-red-500/10"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
};
