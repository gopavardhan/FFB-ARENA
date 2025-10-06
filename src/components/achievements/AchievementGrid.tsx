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