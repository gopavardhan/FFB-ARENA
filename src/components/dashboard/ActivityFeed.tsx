import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export interface Activity {
  id: string;
  type: "tournament" | "payment" | "user" | "system";
  title: string;
  description: string;
  timestamp: Date;
  status?: "success" | "pending" | "failed";
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
}

export const ActivityFeed = ({ activities, title = "Recent Activity" }: ActivityFeedProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tournament":
        return "🏆";
      case "payment":
        return "💰";
      case "user":
        return "👤";
      case "system":
        return "⚙️";
      default:
        return "📌";
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50">
      <h3 className="text-lg font-orbitron font-bold mb-4">{title}</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="text-2xl">{getTypeIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
