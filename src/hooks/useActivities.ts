import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "@/components/dashboard/ActivityFeed";

export const usePlayerActivities = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["player-activities", userId],
    queryFn: async () => {
      if (!userId) return [];

      const activities: Activity[] = [];

      // Fetch recent transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (transactions) {
        transactions.forEach((txn) => {
          activities.push({
            id: txn.id,
            type: txn.type === "deposit" || txn.type === "withdrawal" ? "payment" : "tournament",
            title: txn.description,
            description: `Amount: ₹${txn.amount}`,
            timestamp: new Date(txn.created_at),
            status: "success",
          });
        });
      }

      // Fetch recent tournament registrations
      const { data: registrations } = await supabase
        .from("tournament_registrations")
        .select(`
          *,
          tournaments(name, entry_fee)
        `)
        .eq("user_id", userId)
        .order("registered_at", { ascending: false })
        .limit(5);

      if (registrations) {
        registrations.forEach((reg: any) => {
          activities.push({
            id: reg.id,
            type: "tournament",
            title: "Tournament Joined",
            description: `${reg.tournaments?.name} - Entry: ₹${reg.tournaments?.entry_fee}`,
            timestamp: new Date(reg.registered_at),
            status: "success",
          });
        });
      }

      // Sort by timestamp and return top 10
      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    },
    enabled: !!userId,
    // Enable real-time updates for activity feed
    refetchInterval: 20000, // Refetch every 20 seconds (less frequent for activity feed)
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};

export const useAdminActivities = () => {
  return useQuery({
    queryKey: ["admin-activities"],
    queryFn: async () => {
      const activities: Activity[] = [];

      // Fetch recent tournaments created
      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (tournaments) {
        tournaments.forEach((tournament) => {
          activities.push({
            id: tournament.id,
            type: "tournament",
            title: "Tournament Created",
            description: `${tournament.name} - ${tournament.filled_slots}/${tournament.total_slots} slots filled`,
            timestamp: new Date(tournament.created_at),
            status: tournament.status === "active" ? "success" : "pending",
          });
        });
      }

      // Fetch recent registrations
      const { data: registrations } = await supabase
        .from("tournament_registrations")
        .select(`
          *,
          tournaments(name),
          profiles(full_name)
        `)
        .order("registered_at", { ascending: false })
        .limit(5);

      if (registrations) {
        registrations.forEach((reg: any) => {
          activities.push({
            id: reg.id,
            type: "tournament",
            title: "New Registration",
            description: `${reg.profiles?.full_name} joined ${reg.tournaments?.name}`,
            timestamp: new Date(reg.registered_at),
            status: "success",
          });
        });
      }

      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    },
  });
};

export const useBossActivities = () => {
  return useQuery({
    queryKey: ["boss-activities"],
    queryFn: async () => {
      const activities: Activity[] = [];

      // Fetch recent deposits
      const { data: deposits } = await supabase
        .from("deposits")
        .select(`
          *,
          profiles(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (deposits) {
        deposits.forEach((deposit: any) => {
          activities.push({
            id: deposit.id,
            type: "payment",
            title: deposit.status === "pending" ? "Pending Deposit" : "Deposit Approved",
            description: `${deposit.profiles?.full_name} - ₹${deposit.amount}`,
            timestamp: new Date(deposit.created_at),
            status: deposit.status === "approved" ? "success" : "pending",
          });
        });
      }

      // Fetch recent withdrawals
      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select(`
          *,
          profiles(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (withdrawals) {
        withdrawals.forEach((withdrawal: any) => {
          activities.push({
            id: withdrawal.id,
            type: "payment",
            title: withdrawal.status === "pending" ? "Pending Withdrawal" : "Withdrawal Processed",
            description: `${withdrawal.profiles?.full_name} - ₹${withdrawal.amount}`,
            timestamp: new Date(withdrawal.created_at),
            status: withdrawal.status === "approved" ? "success" : withdrawal.status === "cancelled" ? "failed" : "pending",
          });
        });
      }

      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    },
  });
};
