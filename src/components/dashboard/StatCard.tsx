import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: "secondary" | "accent" | "primary";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "secondary",
  trend 
}: StatCardProps) => {
  const colorClasses = {
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    primary: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br from-card to-card/50 transition-all hover:shadow-lg",
      colorClasses[iconColor].split(" ").slice(2).join(" ")
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg",
            colorClasses[iconColor].split(" ").slice(0, 2).join(" ")
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-orbitron font-bold">{value}</h3>
          </div>
        </div>
        {trend && (
          <div className={cn(
            "text-sm font-semibold",
            trend.isPositive ? "text-green-500" : "text-red-500"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
};
