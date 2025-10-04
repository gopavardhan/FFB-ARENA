import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "premium" | "outline" | "secondary";
  count?: number;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export const QuickActions = ({ actions, title = "Quick Actions" }: QuickActionsProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50">
      <h3 className="text-lg font-orbitron font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            className="justify-start gap-3 h-auto py-4"
            onClick={action.onClick}
          >
            <action.icon className="w-5 h-5" />
            <span className="flex-1 text-left">{action.label}</span>
            {action.count !== undefined && action.count > 0 && (
              <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                {action.count}
              </span>
            )}
          </Button>
        ))}
      </div>
    </Card>
  );
};
