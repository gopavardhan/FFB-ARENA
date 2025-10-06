import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBossCounts = () => {
  return useQuery({
    queryKey: ["boss-counts"],
    queryFn: async () => {
      // Get pending deposits count
      const { count: depositsCount, error: depositsError } = await supabase
        .from("deposits")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (depositsError) throw depositsError;

      // Get pending withdrawals count
      const { count: withdrawalsCount, error: withdrawalsError } = await supabase
        .from("withdrawals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (withdrawalsError) throw withdrawalsError;

      return {
        pendingDeposits: depositsCount || 0,
        pendingWithdrawals: withdrawalsCount || 0,
        totalPending: (depositsCount || 0) + (withdrawalsCount || 0),
      };
    },
    // Enable real-time updates for boss counts (very frequent for dashboard)
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 1000, // Consider data stale after 1 second
  });
};
