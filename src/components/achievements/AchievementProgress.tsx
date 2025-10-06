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