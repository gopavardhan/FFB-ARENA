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
  });
};
