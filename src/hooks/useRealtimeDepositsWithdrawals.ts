import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeDepositsWithdrawals = (userId: string | undefined, userRole: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    console.log("Setting up realtime subscription for deposits/withdrawals");

    const channel = supabase
      .channel(`payment-updates-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deposits",
          filter: userRole === "boss" ? undefined : `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log("Deposit update received:", payload);
          
          if (payload.new.status === "approved" && payload.old.status === "pending") {
            toast({
              title: "Deposit Approved",
              description: `Your deposit of ₹${payload.new.amount} has been approved!`,
            });
          } else if (payload.new.status === "rejected" && payload.old.status === "pending") {
            toast({
              title: "Deposit Rejected",
              description: payload.new.boss_notes || "Your deposit was rejected.",
              variant: "destructive",
            });
          }

          queryClient.invalidateQueries({ queryKey: ["deposits"] });
          queryClient.invalidateQueries({ queryKey: ["pending-deposits"] });
          queryClient.invalidateQueries({ queryKey: ["user_balance"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "withdrawals",
          filter: userRole === "boss" ? undefined : `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log("Withdrawal update received:", payload);
          
          if (payload.new.status === "approved" && payload.old.status === "pending") {
            toast({
              title: "Withdrawal Approved",
              description: `Your withdrawal of ₹${payload.new.amount} has been processed!`,
            });
          } else if (payload.new.status === "cancelled" && payload.old.status === "pending") {
            toast({
              title: "Withdrawal Cancelled",
              description: `${payload.new.cancellation_reason || "Your withdrawal was cancelled."} Amount has been refunded.`,
              variant: "destructive",
            });
          }

          queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
          queryClient.invalidateQueries({ queryKey: ["pending-withdrawals"] });
          queryClient.invalidateQueries({ queryKey: ["user_balance"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }
      )
      .subscribe((status) => {
        console.log("Payment updates subscription status:", status);
      });

    return () => {
      console.log("Cleaning up payment updates subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, userRole, queryClient, toast]);
};
