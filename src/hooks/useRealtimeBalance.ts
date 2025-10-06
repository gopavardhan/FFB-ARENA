import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtimeBalance = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log("🔔 Setting up realtime subscription for user balance:", userId);

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
        async (payload) => {
          console.log("💰 Balance update received:", payload);
          console.log("💰 Event type:", payload.eventType);
          console.log("💰 New balance:", payload.new);
          console.log("💰 Old balance:", payload.old);
          
          // Invalidate and immediately refetch the balance
          await queryClient.invalidateQueries({ 
            queryKey: ["user_balance", userId],
            refetchType: "active" // Only refetch active queries
          });
          
          // Force an immediate refetch to ensure UI updates
          await queryClient.refetchQueries({ 
            queryKey: ["user_balance", userId],
            type: "active"
          });
          
          // Also invalidate transactions to show updated balance_after
          await queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
          
          console.log("✅ Balance cache updated and refetched");
        }
      )
      .subscribe((status) => {
        console.log("📡 Balance subscription status:", status);
        
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to balance changes");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to balance changes");
          // Attempt to resubscribe after a delay
          setTimeout(() => {
            console.log("🔄 Attempting to resubscribe to balance changes");
            channel.subscribe();
          }, 5000);
        }
      });

    return () => {
      console.log("🧹 Cleaning up balance subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
