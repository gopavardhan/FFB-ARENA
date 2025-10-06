import { Card } from "@/components/ui/card";
import { useTeamStatistics } from "@/hooks/useTeams";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { Trophy, Target, TrendingUp, Award } from "lucide-react";

interface TeamStatsProps {
  teamId: string;
}

export const TeamStats = ({ teamId }: TeamStatsProps) => {
  const { data: stats, isLoading } = useTeamStatistics(teamId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const winRate = stats.win_rate.toFixed(1);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Team Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg bg-secondary/5">
          <Trophy className="w-5 h-5 mx-auto mb-2 text-secondary" />
          <p className="text-xl font-bold">{stats.tournaments_won}</p>
          <p className="text-xs text-muted-foreground">Tournaments Won</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-accent/5">
          <Target className="w-5 h-5 mx-auto mb-2 text-accent" />
          <p className="text-xl font-bold">{winRate}%</p>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-primary/5">
          <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-xl font-bold">₹{stats.total_earnings.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Earnings</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-yellow-500/5">
          <Award className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
          <p className="text-xl font-bold">{stats.average_placement.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Avg Placement</p>
        </div>
      </div>
    </Card>
  );
};