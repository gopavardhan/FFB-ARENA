import { StatCard } from "./StatCard";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";
import { usePlayerStatistics } from "@/hooks/usePlayerStats";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

export const StatsOverview = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = usePlayerStatistics(user?.id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No statistics available yet. Play some tournaments to see your stats!
      </div>
    );
  }

  const winRate = stats.win_rate.toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tournaments Won"
        value={stats.tournaments_won}
        icon={Trophy}
        subtitle={`${stats.total_tournaments} tournaments played`}
      />
      <StatCard
        title="Win Rate"
        value={`${winRate}%`}
        icon={Target}
        trend={{
          value: parseFloat(winRate),
          isPositive: parseFloat(winRate) >= 50
        }}
      />
      <StatCard
        title="Total Earnings"
        value={`₹${stats.total_earnings.toFixed(2)}`}
        icon={TrendingUp}
        subtitle="All time"
      />
      <StatCard
        title="Current Streak"
        value={stats.current_streak}
        icon={Award}
        subtitle={stats.current_streak > 0 ? "wins in a row" : "matches"}
      />
    </div>
  );
};
