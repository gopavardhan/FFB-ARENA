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
        (payload) => {
          console.log("Tournament update received:", payload);
          queryClient.invalidateQueries({ queryKey: ["tournaments"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_registrations",
        },
        (payload) => {
          console.log("Registration update received:", payload);
          queryClient.invalidateQueries({ queryKey: ["tournaments"] });
          queryClient.invalidateQueries({ queryKey: ["tournament_registrations"] });
        }
      )
      .subscribe((status) => {
        console.log("Tournament subscription status:", status);
      });

    return () => {
      console.log("Cleaning up tournament subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
