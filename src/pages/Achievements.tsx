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