import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tournament } from "@/types";
import { toast } from "@/hooks/use-toast";

type TournamentStatus = "upcoming" | "active" | "completed" | "cancelled";

export const useTournaments = (filter?: { status?: TournamentStatus }) => {
  return useQuery({
    queryKey: ["tournaments", filter],
    queryFn: async () => {
      let query = supabase
        .from("tournaments")
        .select("*")
        .order("start_date", { ascending: true });

      if (filter?.status) {
        query = query.eq("status", filter.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Tournament[];
    },
    // NO automatic polling - only manual refresh
    refetchInterval: false, // Disabled
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Tournament;
    },
  });
};

export const useRegisterTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      tournamentId, 
      userId, 
      inGameName, 
      friendInGameName 
    }: { 
      tournamentId: string; 
      userId: string;
      inGameName: string;
      friendInGameName?: string;
    }) => {
      const { data, error } = await supabase.rpc("register_for_tournament", {
        p_tournament_id: tournamentId,
        p_user_id: userId,
        p_in_game_name: inGameName,
        p_friend_in_game_name: friendInGameName || null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; balance?: number; slot_number?: number };
      
      if (!result.success) {
        throw new Error(result.error || "Registration failed");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["user_balance"] });
      queryClient.invalidateQueries({ queryKey: ["tournament_registrations"] });
      toast({
        title: "Success",
        description: "Successfully registered for tournament",
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

export const useUserRegistrations = (userId: string) => {
  return useQuery({
    queryKey: ["tournament_registrations", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select("*, tournaments(*)")
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
    // NO automatic polling - only manual refresh
    refetchInterval: false, // Disabled
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    enabled: !!userId,
  });
};

export const useAdminTournaments = (adminId: string) => {
  return useQuery({
    queryKey: ["admin_tournaments", adminId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("created_by", adminId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as Tournament[];
    },
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      userId
    }: {
      tournamentId: string;
      userId: string;
    }) => {
      const { data, error } = await supabase.rpc("delete_tournament_with_refund", {
        p_tournament_id: tournamentId,
        p_deleted_by: userId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string; refunds_issued?: number };

      if (!result.success) {
        throw new Error(result.error || "Failed to delete tournament");
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["admin_tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["user_balance"] });
      queryClient.invalidateQueries({ queryKey: ["tournament_registrations"] });
      toast({
        title: "Tournament Deleted",
        description: `${data.message}. ${data.refunds_issued} refund(s) issued.`,
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
