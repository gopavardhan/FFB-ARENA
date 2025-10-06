import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const BracketLegend = () => {
  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3 text-sm">Legend</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge>completed</Badge>
          <span className="text-muted-foreground">Match finished</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">in_progress</Badge>
          <span className="text-muted-foreground">Match ongoing</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">pending</Badge>
          <span className="text-muted-foreground">Match not started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/10 border border-green-500/20" />
          <span className="text-muted-foreground">Winner</span>
        </div>
      </div>
    </Card>
  );
};