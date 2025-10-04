import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtimeBalance = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log("Setting up realtime subscription for user balance:", userId);

    const channel = supabase
      .channel(`balance-changes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_balances",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Balance update received:", payload);
          queryClient.invalidateQueries({ queryKey: ["user_balance", userId] });
        }
      )
      .subscribe((status) => {
        console.log("Balance subscription status:", status);
      });

    return () => {
      console.log("Cleaning up balance subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
