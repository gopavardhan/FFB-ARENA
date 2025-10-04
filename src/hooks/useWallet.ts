import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useUserBalance = (userId: string) => {
  return useQuery({
    queryKey: ["user_balance", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useUserTransactions = (userId: string) => {
  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
};

export const useUserDeposits = (userId: string) => {
  return useQuery({
    queryKey: ["deposits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useUserWithdrawals = (userId: string) => {
  return useQuery({
    queryKey: ["withdrawals", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      utrNumber,
      screenshotUrl,
    }: {
      userId: string;
      amount: number;
      utrNumber: string;
      screenshotUrl: string;
    }) => {
      const { data, error } = await supabase
        .from("deposits")
        .insert({
          user_id: userId,
          amount,
          utr_number: utrNumber,
          screenshot_url: screenshotUrl,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      toast({
        title: "Deposit Request Submitted",
        description: "Your deposit request has been submitted for approval",
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

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      upiId,
    }: {
      userId: string;
      amount: number;
      upiId: string;
    }) => {
      const { data, error } = await supabase
        .from("withdrawals")
        .insert({
          user_id: userId,
          amount,
          upi_id: upiId,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["user_balance"] });
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted for processing",
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
