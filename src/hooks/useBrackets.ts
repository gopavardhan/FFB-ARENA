import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TournamentBracket, BracketMatch, BracketStructure } from "@/types/features";
import { toast } from "@/hooks/use-toast";

// Fetch tournament bracket
export const useTournamentBracket = (tournamentId: string | undefined) => {
  return useQuery({
    queryKey: ["tournament-bracket", tournamentId],
    queryFn: async () => {
      if (!tournamentId) throw new Error("Tournament ID is required");

      const { data, error } = await supabase
        .from("tournament_brackets" as any)
        .select(`
          *,
          player1:player1_id (
            id,
            profiles (
              full_name,
              username
            )
          ),
          player2:player2_id (
            id,
            profiles (
              full_name,
              username
            )
          ),
          winner:winner_id (
            id,
            profiles (
              full_name,
              username
            )
          )
        `)
        .eq("tournament_id", tournamentId)
        .order("round_number", { ascending: true })
        .order("match_number", { ascending: true });

      if (error) throw error;

      // Transform data into bracket structure
      const matches = data as any[];
      const rounds = new Map<number, BracketMatch[]>();

      matches.forEach((match: any) => {
        const bracketMatch: BracketMatch = {
          ...match,
          player1: match.player1 ? {
            id: match.player1.id,
            full_name: match.player1.profiles?.full_name || "Unknown",
            username: match.player1.profiles?.username || "unknown",
          } : undefined,
          player2: match.player2 ? {
            id: match.player2.id,
            full_name: match.player2.profiles?.full_name || "Unknown",
            username: match.player2.profiles?.username || "unknown",
          } : undefined,
          winner: match.winner ? {
            id: match.winner.id,
            full_name: match.winner.profiles?.full_name || "Unknown",
            username: match.winner.profiles?.username || "unknown",
          } : undefined,
        };

        if (!rounds.has(match.round_number)) {
          rounds.set(match.round_number, []);
        }
        rounds.get(match.round_number)!.push(bracketMatch);
      });

      const bracketStructure: BracketStructure = {
        tournament_id: tournamentId,
        total_rounds: rounds.size,
        rounds: Array.from(rounds.entries()).map(([round_number, matches]) => ({
          round_number,
          matches,
        })),
      };

      return bracketStructure;
    },
    enabled: !!tournamentId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Generate bracket for tournament
export const useGenerateBracket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data, error } = await supabase.rpc("generate_tournament_bracket" as any, {
        p_tournament_id: tournamentId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-bracket", tournamentId] });
      toast({
        title: "Bracket Generated",
        description: "Tournament bracket has been created successfully",
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

// Update match result
export const useUpdateMatchResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      winnerId,
      player1Score,
      player2Score,
    }: {
      matchId: string;
      winnerId: string;
      player1Score: number;
      player2Score: number;
    }) => {
      const { data, error } = await supabase
        .from("tournament_brackets" as any)
        .update({
          winner_id: winnerId,
          player1_score: player1Score,
          player2_score: player2Score,
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;

      // Advance winner to next round
      const match = data as any;
      await advanceWinnerToNextRound(match);

      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-bracket", data.tournament_id] });
      toast({
        title: "Match Result Updated",
        description: "Winner has been advanced to the next round",
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

// Helper function to advance winner to next round
async function advanceWinnerToNextRound(match: any) {
  const nextRound = match.round_number + 1;
  const nextMatchNumber = Math.ceil(match.match_number / 2);

  // Check if next round match exists
  const { data: nextMatch, error: fetchError } = await supabase
    .from("tournament_brackets" as any)
    .select("*")
    .eq("tournament_id", match.tournament_id)
    .eq("round_number", nextRound)
    .eq("match_number", nextMatchNumber)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error fetching next match:", fetchError);
    return;
  }

  if (!nextMatch) {
    // This was the final match
    return;
  }

  // Determine if winner goes to player1 or player2 slot
  const isPlayer1Slot = match.match_number % 2 === 1;
  const updateField = isPlayer1Slot ? "player1_id" : "player2_id";

  const { error: updateError } = await supabase
    .from("tournament_brackets" as any)
    .update({
      [updateField]: match.winner_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", nextMatch.id);

  if (updateError) {
    console.error("Error advancing winner:", updateError);
  }
}

// Update match status
export const useUpdateMatchStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      status,
      tournamentId,
    }: {
      matchId: string;
      status: "pending" | "in_progress" | "completed";
      tournamentId: string;
    }) => {
      const { data, error } = await supabase
        .from("tournament_brackets" as any)
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-bracket", variables.tournamentId] });
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

// Get specific match details
export const useMatchDetails = (matchId: string | undefined) => {
  return useQuery({
    queryKey: ["match-details", matchId],
    queryFn: async () => {
      if (!matchId) throw new Error("Match ID is required");

      const { data, error } = await supabase
        .from("tournament_brackets" as any)
        .select(`
          *,
          player1:player1_id (
            id,
            profiles (
              full_name,
              username
            )
          ),
          player2:player2_id (
            id,
            profiles (
              full_name,
              username
            )
          ),
          winner:winner_id (
            id,
            profiles (
              full_name,
              username
            )
          ),
          tournament:tournament_id (
            id,
            name,
            status
          )
        `)
        .eq("id", matchId)
        .single();

      if (error) throw error;
      return data as BracketMatch;
    },
    enabled: !!matchId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Get current round matches
export const useCurrentRoundMatches = (tournamentId: string | undefined) => {
  return useQuery({
    queryKey: ["current-round-matches", tournamentId],
    queryFn: async () => {
      if (!tournamentId) throw new Error("Tournament ID is required");

      // Find the lowest round number with pending or in-progress matches
      const { data: matches, error } = await supabase
        .from("tournament_brackets" as any)
        .select("*")
        .eq("tournament_id", tournamentId)
        .in("status", ["pending", "in_progress"])
        .order("round_number", { ascending: true })
        .order("match_number", { ascending: true });

      if (error) throw error;

      if (!matches || matches.length === 0) {
        return { round_number: 0, matches: [] };
      }

      const currentRound = matches[0].round_number;
      const currentRoundMatches = matches.filter((m: any) => m.round_number === currentRound);

      return {
        round_number: currentRound,
        matches: currentRoundMatches,
      };
    },
    enabled: !!tournamentId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Delete bracket (admin only)
export const useDeleteBracket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase
        .from("tournament_brackets" as any)
        .delete()
        .eq("tournament_id", tournamentId);

      if (error) throw error;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-bracket", tournamentId] });
      toast({
        title: "Bracket Deleted",
        description: "Tournament bracket has been removed",
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
