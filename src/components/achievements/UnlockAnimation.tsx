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