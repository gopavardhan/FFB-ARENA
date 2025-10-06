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