import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Achievement, UserAchievement, AchievementWithProgress, AchievementFilters } from "@/types/features";
import { toast } from "@/hooks/use-toast";

// Fetch all achievements
export const useAchievements = (filters?: AchievementFilters) => {
  return useQuery({
    queryKey: ["achievements", filters],
    queryFn: async () => {
      let query = supabase
        .from("achievements" as any)
        .select("*")
        .eq("is_active", true);

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.rarity) {
        query = query.eq("rarity", filters.rarity);
      }

      const { data, error } = await query.order("points", { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes - achievements don't change often
  });
};

// Fetch user's achievements with progress
export const useUserAchievements = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("user_achievements" as any)
        .select(`
          *,
          achievements (
            id,
            name,
            description,
            icon,
            category,
            requirement_type,
            requirement_value,
            points,
            rarity,
            is_active
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!userId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Get achievements with progress for a user
export const useAchievementsWithProgress = (userId: string | undefined, filters?: AchievementFilters) => {
  const { data: allAchievements } = useAchievements(filters);
  const { data: userAchievements } = useUserAchievements(userId);

  return useQuery({
    queryKey: ["achievements-with-progress", userId, filters],
    queryFn: async () => {
      if (!allAchievements || !userAchievements) {
        return { unlocked: [], locked: [], totalPoints: 0, completionPercentage: 0 };
      }

      const achievementsMap = new Map(
        userAchievements.map(ua => [ua.achievement_id, ua])
      );

      const achievementsWithProgress: AchievementWithProgress[] = allAchievements.map(achievement => {
        const userAchievement = achievementsMap.get(achievement.id);
        
        return {
          ...achievement,
          progress: userAchievement?.progress || 0,
          is_unlocked: userAchievement?.is_unlocked || false,
          unlocked_at: userAchievement?.unlocked_at || null,
        };
      });

      const unlocked = achievementsWithProgress.filter(a => a.is_unlocked);
      const locked = achievementsWithProgress.filter(a => !a.is_unlocked);
      const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0);
      const completionPercentage = (unlocked.length / achievementsWithProgress.length) * 100;

      return {
        unlocked,
        locked,
        totalPoints,
        completionPercentage,
      };
    },
    enabled: !!allAchievements && !!userAchievements && !!userId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Check and unlock achievements for a user
export const useCheckAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc("check_achievements" as any, {
        p_user_id: userId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements", userId] });
      queryClient.invalidateQueries({ queryKey: ["achievements-with-progress", userId] });
    },
    onError: (error: Error) => {
      console.error("Error checking achievements:", error);
    },
  });
};

// Manually unlock achievement (admin only)
export const useUnlockAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      achievementId,
    }: {
      userId: string;
      achievementId: string;
    }) => {
      const { data, error } = await supabase
        .from("user_achievements" as any)
        .upsert({
          user_id: userId,
          achievement_id: achievementId,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          progress: 100,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["achievements-with-progress", variables.userId] });
      toast({
        title: "Achievement Unlocked! 🎉",
        description: "You've earned a new achievement!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Update achievement progress
export const useUpdateAchievementProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      achievementId,
      progress,
    }: {
      userId: string;
      achievementId: string;
      progress: number;
    }) => {
      const { data, error } = await supabase
        .from("user_achievements" as any)
        .upsert({
          user_id: userId,
          achievement_id: achievementId,
          progress,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["achievements-with-progress", variables.userId] });
    },
    onError: (error: Error) => {
      console.error("Error updating achievement progress:", error);
    },
  });
};

// Get achievement categories with counts
export const useAchievementCategories = (userId: string | undefined) => {
  const { data: achievementsData } = useAchievementsWithProgress(userId);

  return useQuery({
    queryKey: ["achievement-categories", userId],
    queryFn: async () => {
      if (!achievementsData) return [];

      const categories = ['tournament', 'earnings', 'social', 'special'];
      
      return categories.map(category => {
        const categoryAchievements = [
          ...achievementsData.unlocked,
          ...achievementsData.locked
        ].filter(a => a.category === category);
        
        const unlockedCount = categoryAchievements.filter(a => a.is_unlocked).length;
        
        return {
          category,
          total: categoryAchievements.length,
          unlocked: unlockedCount,
          percentage: (unlockedCount / categoryAchievements.length) * 100,
        };
      });
    },
    enabled: !!achievementsData && !!userId,
    refetchInterval: false,
    staleTime: 0,
  });
};

// Get recently unlocked achievements
export const useRecentAchievements = (userId: string | undefined, limit: number = 5) => {
  return useQuery({
    queryKey: ["recent-achievements", userId, limit],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("user_achievements" as any)
        .select(`
          *,
          achievements (
            id,
            name,
            description,
            icon,
            category,
            points,
            rarity
          )
        `)
        .eq("user_id", userId)
        .eq("is_unlocked", true)
        .order("unlocked_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!userId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
