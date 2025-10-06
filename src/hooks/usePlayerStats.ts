import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlayerStatistics, PerformanceData, StatsResponse } from "@/types/features";
import { toast } from "@/hooks/use-toast";

// Fetch player statistics
export const usePlayerStatistics = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["player-statistics", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("player_statistics" as any)
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // If no statistics exist, return default values
      if (!data) {
        return {
          id: "",
          user_id: userId,
          total_tournaments: 0,
          tournaments_won: 0,
          tournaments_top3: 0,
          total_earnings: 0,
          total_spent: 0,
          win_rate: 0,
          average_placement: 0,
          best_placement: 0,
          current_streak: 0,
          longest_streak: 0,
          favorite_game_mode: null,
          last_tournament_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as PlayerStatistics;
      }

      return data as PlayerStatistics;
    },
    enabled: !!userId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });
};

// Fetch recent performance data
export const useRecentPerformance = (userId: string | undefined, days: number = 30) => {
  return useQuery({
    queryKey: ["recent-performance", userId, days],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get tournament registrations with results
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select(`
          registered_at,
          placement,
          tournaments (
            id,
            name,
            prize_pool,
            status,
            start_date
          )
        `)
        .eq("user_id", userId)
        .gte("registered_at", startDate.toISOString())
        .order("registered_at", { ascending: true });

      if (error) throw error;

      // Group by date and calculate metrics
      const performanceMap = new Map<string, PerformanceData>();

      data?.forEach((reg: any) => {
        const date = new Date(reg.registered_at).toISOString().split('T')[0];
        
        if (!performanceMap.has(date)) {
          performanceMap.set(date, {
            date,
            tournaments: 0,
            wins: 0,
            earnings: 0,
          });
        }

        const dayData = performanceMap.get(date)!;
        dayData.tournaments += 1;
        
        if (reg.placement === 1) {
          dayData.wins += 1;
          dayData.earnings += reg.tournaments?.prize_pool || 0;
        }
      });

      return Array.from(performanceMap.values());
    },
    enabled: !!userId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Fetch player ranking
export const usePlayerRanking = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["player-ranking", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      // Get user's statistics
      const { data: userStats, error: userError } = await supabase
        .from("player_statistics" as any)
        .select("win_rate, total_earnings")
        .eq("user_id", userId)
        .single();

      if (userError) throw userError;

      // Get overall ranking by win rate
      const { count: winRateRank, error: winRateError } = await supabase
        .from("player_statistics" as any)
        .select("*", { count: "exact", head: true })
        .gt("win_rate", userStats?.win_rate || 0);

      if (winRateError) throw winRateError;

      // Get overall ranking by earnings
      const { count: earningsRank, error: earningsError } = await supabase
        .from("player_statistics" as any)
        .select("*", { count: "exact", head: true })
        .gt("total_earnings", userStats?.total_earnings || 0);

      if (earningsError) throw earningsError;

      // Get total players
      const { count: totalPlayers, error: totalError } = await supabase
        .from("player_statistics" as any)
        .select("*", { count: "exact", head: true });

      if (totalError) throw totalError;

      return {
        overall: (winRateRank || 0) + 1,
        byWinRate: (winRateRank || 0) + 1,
        byEarnings: (earningsRank || 0) + 1,
        totalPlayers: totalPlayers || 0,
      };
    },
    enabled: !!userId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Fetch leaderboard
export const useLeaderboard = (sortBy: 'win_rate' | 'total_earnings' | 'tournaments_won' = 'win_rate', limit: number = 10) => {
  return useQuery({
    queryKey: ["leaderboard", sortBy, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_statistics" as any)
        .select(`
          *,
          profiles:user_id (
            full_name,
            username
          )
        `)
        .order(sortBy, { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });
};

// Initialize player statistics
export const useInitializeStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from("player_statistics" as any)
        .insert({
          user_id: userId,
          total_tournaments: 0,
          tournaments_won: 0,
          tournaments_top3: 0,
          total_earnings: 0,
          total_spent: 0,
          win_rate: 0,
          average_placement: 0,
          best_placement: 0,
          current_streak: 0,
          longest_streak: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["player-statistics", userId] });
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

// Manual statistics update (for admin/testing)
export const useUpdateStatistics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<PlayerStatistics>;
    }) => {
      const { data, error } = await supabase
        .from("player_statistics" as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["player-statistics", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      toast({
        title: "Success",
        description: "Statistics updated successfully",
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

// Get comprehensive stats response
export const useComprehensiveStats = (userId: string | undefined) => {
  const { data: statistics } = usePlayerStatistics(userId);
  const { data: recentPerformance } = useRecentPerformance(userId);
  const { data: ranking } = usePlayerRanking(userId);

  return {
    statistics,
    recentPerformance: recentPerformance || [],
    ranking: ranking || { overall: 0, byWinRate: 0, byEarnings: 0, totalPlayers: 0 },
    isLoading: !statistics || !recentPerformance || !ranking,
  };
};
