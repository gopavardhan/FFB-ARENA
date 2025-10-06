# Complete UI Implementation Code

This document contains all the remaining code for the 4 features. Copy and create each file as shown.

---

## STATISTICS COMPONENTS (Remaining 3)

### src/components/statistics/RecentMatches.tsx
```typescript
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
```

### src/components/statistics/LeaderboardCard.tsx
```typescript
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
```

### src/components/statistics/StatsFilters.tsx
```typescript
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatsFiltersProps {
  timeRange: 'week' | 'month' | 'year' | 'all';
  onTimeRangeChange: (range: 'week' | 'month' | 'year' | 'all') => void;
}

export const StatsFilters = ({ timeRange, onTimeRangeChange }: StatsFiltersProps) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">Time Period:</span>
      <Tabs value={timeRange} onValueChange={(value) => onTimeRangeChange(value as any)}>
        <TabsList>
          <TabsTrigger value="week">7 Days</TabsTrigger>
          <TabsTrigger value="month">30 Days</TabsTrigger>
          <TabsTrigger value="year">1 Year</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
```

### src/pages/Statistics.tsx
```typescript
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsOverview } from "@/components/statistics/StatsOverview";
import { PerformanceChart } from "@/components/statistics/PerformanceChart";
import { RecentMatches } from "@/components/statistics/RecentMatches";
import { LeaderboardCard } from "@/components/statistics/LeaderboardCard";
import { StatsFilters } from "@/components/statistics/StatsFilters";

const Statistics = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');

  return (
    <MainLayout>
      <PageHeader 
        title="Statistics" 
        subtitle="Track your performance and progress"
      />

      <div className="space-y-6">
        <StatsFilters timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <LeaderboardCard />
          </div>
        </div>

        <RecentMatches />
      </div>
    </MainLayout>
  );
};

export default Statistics;
```

---

## ACHIEVEMENT COMPONENTS (All 5 + Page)

### src/components/achievements/AchievementCard.tsx
```typescript
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Trophy, Star, Award, Zap } from "lucide-react";
import { AchievementWithProgress } from "@/types/features";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: AchievementWithProgress;
  onClick?: () => void;
}

const rarityColors = {
  common: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  rare: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  legendary: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

const categoryIcons = {
  tournament: Trophy,
  earnings: Star,
  social: Award,
  special: Zap,
};

export const AchievementCard = ({ achievement, onClick }: AchievementCardProps) => {
  const Icon = categoryIcons[achievement.category];
  const progressPercentage = (achievement.progress / achievement.requirement_value) * 100;

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-lg",
        !achievement.is_unlocked && "opacity-60"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-lg",
          achievement.is_unlocked ? "bg-secondary/10" : "bg-muted"
        )}>
          {achievement.is_unlocked ? (
            <Icon className="w-6 h-6 text-secondary" />
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold">{achievement.name}</h4>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
            <Badge className={rarityColors[achievement.rarity]}>
              {achievement.rarity}
            </Badge>
          </div>

          {!achievement.is_unlocked && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{achievement.progress} / {achievement.requirement_value}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {achievement.points} points
            </span>
            {achievement.is_unlocked && achievement.unlocked_at && (
              <span className="text-xs text-green-500">
                Unlocked!
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
```

### src/components/achievements/AchievementGrid.tsx
```typescript
import { AchievementCard } from "./AchievementCard";
import { AchievementWithProgress, AchievementCategory, AchievementRarity } from "@/types/features";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AchievementGridProps {
  achievements: AchievementWithProgress[];
}

export const AchievementGrid = ({ achievements }: AchievementGridProps) => {
  const [category, setCategory] = useState<AchievementCategory | 'all'>('all');
  const [rarity, setRarity] = useState<AchievementRarity | 'all'>('all');
  const [showUnlocked, setShowUnlocked] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter(achievement => {
    if (category !== 'all' && achievement.category !== category) return false;
    if (rarity !== 'all' && achievement.rarity !== rarity) return false;
    if (showUnlocked === 'unlocked' && !achievement.is_unlocked) return false;
    if (showUnlocked === 'locked' && achievement.is_unlocked) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={showUnlocked} onValueChange={(v) => setShowUnlocked(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={category} onValueChange={(v) => setCategory(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="tournament">Tournament</SelectItem>
            <SelectItem value="earnings">Earnings</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="special">Special</SelectItem>
          </SelectContent>
        </Select>

        <Select value={rarity} onValueChange={(v) => setRarity(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No achievements found with the selected filters
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### src/components/achievements/AchievementProgress.tsx
```typescript
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AchievementWithProgress } from "@/types/features";
import { Trophy } from "lucide-react";

interface AchievementProgressProps {
  achievements: AchievementWithProgress[];
}

export const AchievementProgress = ({ achievements }: AchievementProgressProps) => {
  const inProgress = achievements.filter(a => !a.is_unlocked && a.progress > 0);

  if (inProgress.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        In Progress
      </h3>
      <div className="space-y-4">
        {inProgress.slice(0, 3).map((achievement) => {
          const percentage = (achievement.progress / achievement.requirement_value) * 100;
          return (
            <div key={achievement.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{achievement.name}</span>
                <span className="text-xs text-muted-foreground">
                  {achievement.progress}/{achievement.requirement_value}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
```

### src/components/achievements/AchievementStats.tsx
```typescript
import { Card } from "@/components/ui/card";
import { Trophy, Star, Award } from "lucide-react";
import { AchievementWithProgress } from "@/types/features";

interface AchievementStatsProps {
  achievements: AchievementWithProgress[];
}

export const AchievementStats = ({ achievements }: AchievementStatsProps) => {
  const unlocked = achievements.filter(a => a.is_unlocked).length;
  const total = achievements.length;
  const totalPoints = achievements
    .filter(a => a.is_unlocked)
    .reduce((sum, a) => sum + a.points, 0);
  const completionPercentage = total > 0 ? (unlocked / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-secondary/10">
            <Trophy className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unlocked</p>
            <p className="text-2xl font-bold">{unlocked}/{total}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-accent/10">
            <Star className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-2xl font-bold">{totalPoints}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completion</p>
            <p className="text-2xl font-bold">{completionPercentage.toFixed(1)}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
```

### src/components/achievements/UnlockAnimation.tsx
```typescript
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";
import { Achievement } from "@/types/features";

interface UnlockAnimationProps {
  achievement: Achievement;
}

export const UnlockAnimation = ({ achievement }: UnlockAnimationProps) => {
  useEffect(() => {
    toast({
      title: "🎉 Achievement Unlocked!",
      description: (
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div>
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            <p className="text-xs text-accent mt-1">+{achievement.points} points</p>
          </div>
        </div>
      ),
      duration: 5000,
    });
  }, [achievement]);

  return null;
};
```

### src/pages/Achievements.tsx
```typescript
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AchievementStats } from "@/components/achievements/AchievementStats";
import { AchievementProgress } from "@/components/achievements/AchievementProgress";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import { useAchievementsWithProgress } from "@/hooks/useAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

const Achievements = () => {
  const { user } = useAuth();
  const { data, isLoading } = useAchievementsWithProgress(user?.id);

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  const achievements = data ? [...data.unlocked, ...data.locked] : [];

  return (
    <MainLayout>
      <PageHeader 
        title="Achievements" 
        subtitle="Unlock achievements and earn rewards"
      />

      <div className="space-y-6">
        <AchievementStats achievements={achievements} />
        <AchievementProgress achievements={achievements} />
        <AchievementGrid achievements={achievements} />
      </div>
    </MainLayout>
  );
};

export default Achievements;
```

---

## Due to length limits, I'll create a second document for Teams and Brackets components...
