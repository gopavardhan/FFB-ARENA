import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { useLeaderboard, usePlayerRanking } from "@/hooks/usePlayerStats";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

export const LeaderboardCard = () => {
  const { user } = useAuth();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(10);
  const { data: ranking, isLoading: rankingLoading } = usePlayerRanking(user?.id);

  if (leaderboardLoading || rankingLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Leaderboard</h3>
        {ranking && (
          <Badge variant="secondary">
            Your Rank: #{ranking.rank}
          </Badge>
        )}
      </div>

      {!leaderboard || leaderboard.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No leaderboard data available
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((player, index) => (
            <div
              key={player.user_id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                player.user_id === user?.id
                  ? 'bg-secondary/20 border border-secondary'
                  : 'bg-secondary/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold">{player.profiles?.username || 'Player'}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.tournaments_won} wins
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-500">
                  ₹{player.total_earnings.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {player.win_rate.toFixed(1)}% WR
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};