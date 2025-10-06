import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingDown } from "lucide-react";
import { useComprehensiveStats } from "@/hooks/usePlayerStats";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { format } from "date-fns";

export const RecentMatches = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useComprehensiveStats(user?.id);

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  // Mock recent matches - in production, this would come from a real endpoint
  const recentMatches = stats?.statistics?.last_tournament_date ? [
    {
      id: '1',
      tournament: 'Battle Royale Championship',
      date: stats.statistics.last_tournament_date,
      placement: stats.statistics.best_placement,
      earnings: 500,
      isWin: stats.statistics.best_placement === 1
    }
  ] : [];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Tournaments</h3>
      {recentMatches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recent tournaments
        </div>
      ) : (
        <div className="space-y-3">
          {recentMatches.map((match) => (
            <div 
              key={match.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {match.isWin ? (
                  <Trophy className="w-5 h-5 text-yellow-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-semibold">{match.tournament}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(match.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={match.isWin ? "default" : "secondary"}>
                  #{match.placement}
                </Badge>
                <p className="text-sm font-semibold text-green-500 mt-1">
                  +₹{match.earnings}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};