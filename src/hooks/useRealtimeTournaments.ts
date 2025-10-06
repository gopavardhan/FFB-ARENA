import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useRealtimeTournaments = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Setting up realtime subscription for tournaments");

    const channel = supabase
      .channel("tournament-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournaments",
        },
        async (payload) => {
          console.log("Tournament update received:", payload);

          // Invalidate and immediately refetch tournament queries
          await queryClient.invalidateQueries({
            queryKey: ["tournaments"],
            refetchType: "active"
          });
          await queryClient.refetchQueries({
            queryKey: ["tournaments"],
            type: "active"
          });

          // Also invalidate admin tournaments
          await queryClient.invalidateQueries({
            queryKey: ["admin_tournaments"],
            refetchType: "active"
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_registrations",
        },
        async (payload) => {
          console.log("Registration update received:", payload);

          // Invalidate and refetch all related queries
          await queryClient.invalidateQueries({
            queryKey: ["tournaments"],
            refetchType: "active"
          });
          await queryClient.invalidateQueries({
            queryKey: ["tournament_registrations"],
            refetchType: "active"
          });
          await queryClient.invalidateQueries({
            queryKey: ["user_balance"],
            refetchType: "active"
          });

          // Force refetch
          await queryClient.refetchQueries({
            queryKey: ["tournaments"],
            type: "active"
          });
          await queryClient.refetchQueries({
            queryKey: ["tournament_registrations"],
            type: "active"
          });
        }
      )
      .subscribe((status) => {
        console.log("Tournament subscription status:", status);

        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to tournament changes");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to tournament changes");
          // Attempt to resubscribe after a delay
          setTimeout(() => {
            console.log("Attempting to resubscribe to tournament changes");
            channel.subscribe();
          }, 5000);
        }
      });

    return () => {
      console.log("Cleaning up tournament subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
