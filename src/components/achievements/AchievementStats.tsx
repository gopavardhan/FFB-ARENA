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