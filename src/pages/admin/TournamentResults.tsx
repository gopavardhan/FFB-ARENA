import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTournament } from "@/hooks/useTournaments";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { Trophy, ArrowLeft, Users, Crown, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Registration {
  id: string;
  user_id: string;
  in_game_name: string;
  friend_in_game_name: string;
  slot_number: number;
  profiles: {
    full_name: string;
    email: string;
  };
}

const TournamentResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tournament, isLoading } = useTournament(id!);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [winnerId, setWinnerId] = useState<string>("");
  const [selectedWinner, setSelectedWinner] = useState<Registration | null>(null);

  // Parse team members helper
  const parseTeamMembers = (friendInGameName: string | null) => {
    if (!friendInGameName) return [];
    
    try {
      const parsed = JSON.parse(friendInGameName);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
      return [parsed];
    } catch (e) {
      return [friendInGameName];
    }
  };

  // Handle winner selection
  const handleWinnerSelect = (userId: string) => {
    setWinnerId(userId);
    const winner = registrations?.find(reg => reg.user_id === userId);
    setSelectedWinner(winner || null);
  };

  const { data: registrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: ["tournament_registrations_full", id],
    queryFn: async () => {
      const { data: regs, error: regsError } = await supabase
        .from("tournament_registrations")
        .select("*")
        .eq("tournament_id", id!);

      if (regsError) throw regsError;

      const userIds = regs.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const merged = regs.map(reg => {
        const profile = profiles.find(p => p.id === reg.user_id);
        return {
          ...reg,
          profiles: {
            full_name: profile?.full_name || "Unknown",
            email: profile?.email || "",
          }
        };
      });

      return merged as Registration[];
    },
    enabled: !!id,
  });

  // Fetch existing result (rank 1) to ensure winner is declared only once
  const { data: existingResult, isLoading: loadingExistingResult } = useQuery({
    queryKey: ["tournament_results", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_results")
        .select("*")
        .eq("tournament_id", id!)
        .eq("rank", 1)
        .maybeSingle();

      if (error) throw error;
      return data ?? null;
    },
    enabled: !!id,
  });

  const prizeDistribution = tournament?.prize_distribution as Record<string, number> || {};
  const winnerPrize = prizeDistribution["1"] || 0;

  const handleSubmit = async () => {
    if (!winnerId) {
      toast({
        title: "Error",
        description: "Please select a winner",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prevent posting a winner if one already exists
      const { data: checkData, error: checkError } = await supabase
        .from("tournament_results")
        .select("*")
        .eq("tournament_id", id!)
        .eq("rank", 1)
        .maybeSingle();

      if (checkError) throw checkError;

      if (checkData) {
        toast({
          title: "Winner Already Declared",
          description: "A winner has already been declared for this tournament.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create result for winner (final)
      const { error: resultsError } = await supabase
        .from("tournament_results")
        .insert({
          tournament_id: id,
          user_id: winnerId,
          rank: 1,
          kills: 0,
          prize_amount: winnerPrize,
        });

      if (resultsError) throw resultsError;

      // Try to use RPC function first, fallback to manual distribution
      let totalDistributed = 0;
      
      try {
        const { data: prizeData, error: prizeError } = await supabase.rpc(
          "distribute_tournament_prizes",
          {
            p_tournament_id: id!,
            p_admin_id: (await supabase.auth.getUser()).data.user?.id,
          }
        );

        if (prizeError) {
          console.error("RPC function error:", prizeError);
          throw new Error("RPC function failed, using fallback");
        }

        totalDistributed = typeof prizeData === 'object' && prizeData && 'total_distributed' in prizeData 
          ? prizeData.total_distributed 
          : 0;
      } catch (rpcError) {
        console.log("RPC function not available, using direct method");
        
        // Fallback: Manually credit the prize
        // 1. Get current balance
        const { data: balanceData, error: getBalanceError } = await supabase
          .from("user_balances")
          .select("amount")
          .eq("user_id", winnerId)
          .single();

        if (getBalanceError) {
          console.error("Get balance error:", getBalanceError);
          throw new Error(`Failed to get current balance: ${getBalanceError.message}`);
        }

        const currentBalance = balanceData?.amount || 0;
        const newBalance = currentBalance + winnerPrize;

        // 2. Update user balance
        const { error: balanceError } = await supabase
          .from("user_balances")
          .update({
            amount: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", winnerId);

        if (balanceError) {
          console.error("Balance update error:", balanceError);
          throw new Error(`Failed to credit prize: ${balanceError.message}`);
        }

        // 3. Create transaction record (without status field if it doesn't exist)
        try {
          const { error: transactionError } = await supabase
            .from("transactions")
            .insert({
              user_id: winnerId,
              type: "tournament_win",
              amount: winnerPrize,
              description: `Prize for ${tournament?.name} (Rank 1)`,
            });

          if (transactionError) {
            console.log("Transaction creation skipped (table schema mismatch)");
            // Don't throw here, balance is already credited
          }
        } catch (txError) {
          console.log("Transaction creation skipped");
          // Don't throw here, balance is already credited
        }

        totalDistributed = winnerPrize;
      }

      // Update tournament status to completed (non-blocking, do this last)
      try {
        const { error: tournamentError } = await supabase
          .from("tournaments")
          .update({ status: "completed" })
          .eq("id", id!);

        if (tournamentError) {
          console.error("Tournament status update error:", tournamentError);
          // Don't throw - prize is already credited
        }
      } catch (statusError) {
        console.error("Failed to update tournament status:", statusError);
        // Don't throw - prize is already credited
      }

      toast({
        title: "Success",
        description: `Winner declared! Prize of ₹${totalDistributed.toFixed(2)} credited to winner's account.`,
      });

      navigate("/admin/tournaments");
    } catch (error) {
      console.error("Full error object:", error);
      
      let message = "An unknown error occurred";
      
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle PostgrestError or other object errors
        const err = error as any;
        message = err.message || err.error_description || err.hint || JSON.stringify(error);
      } else if (typeof error === 'string') {
        message = error;
      }
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loadingRegistrations) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Declare Tournament Winner"
        subtitle={tournament?.name || ""}
      />

      <Button 
        variant="outline" 
        onClick={() => navigate("/admin/tournaments")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tournaments
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Winner Prize</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-lg text-center border-2 border-secondary/50">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-secondary" />
            <div className="text-3xl font-bold text-secondary">₹{winnerPrize}</div>
            <div className="text-sm text-muted-foreground mt-1">Winner takes all</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            {existingResult ? "Winner Declared" : "Select the Winner"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {existingResult ? (
              <div className="space-y-3">
                <div className="p-4 bg-accent/5 rounded-lg">
                  <h4 className="font-semibold">Declared Winner</h4>
                  <p className="text-sm">User ID: <span className="font-mono">{existingResult.user_id}</span></p>
                </div>

                <Button variant="outline" className="w-full" disabled>
                  Winner Declared
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Choose the tournament winner
                  </Label>
                  <Select
                    value={winnerId}
                    onValueChange={handleWinnerSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select winner from participants" />
                    </SelectTrigger>
                    <SelectContent>
                      {registrations?.map((reg) => {
                        const teamMembers = parseTeamMembers(reg.friend_in_game_name);
                        const teamSize = teamMembers.length + 1; // +1 for the main player

                        return (
                          <SelectItem key={reg.user_id} value={reg.user_id}>
                            <div className="flex flex-col py-2 w-full">
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="font-semibold text-base">
                                  {reg.in_game_name}
                                </span>
                                <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                                  Slot #{reg.slot_number}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">
                                {reg.profiles.full_name} • {reg.profiles.email}
                              </span>
                              {teamMembers.length > 0 && (
                                <div className="mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    Team ({teamSize} players): {teamMembers.join(", ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Winner Preview Card */}
                {selectedWinner && (
                  <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <Crown className="w-5 h-5" />
                        Selected Winner Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Main Player Info */}
                        <div className="flex items-center justify-between p-4 bg-card/60 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                              <Crown className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{selectedWinner.in_game_name}</h4>
                              <p className="text-sm text-muted-foreground">{selectedWinner.profiles.full_name}</p>
                              <p className="text-xs text-muted-foreground">{selectedWinner.profiles.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Slot</div>
                            <div className="text-xl font-bold text-secondary">#{selectedWinner.slot_number}</div>
                          </div>
                        </div>

                        {/* Team Members */}
                        {parseTeamMembers(selectedWinner.friend_in_game_name).length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Team Members</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {parseTeamMembers(selectedWinner.friend_in_game_name).map((member, index) => (
                                <div key={index} className="p-3 bg-card/40 rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                                      <Users className="w-4 h-4 text-secondary" />
                                    </div>
                                    <span className="font-medium">{member}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Prize Info */}
                        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-green-500" />
                              <span className="font-semibold">Prize Amount</span>
                            </div>
                            <div className="text-2xl font-bold text-green-500">₹{winnerPrize}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Will be automatically credited to winner's account
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !winnerId}
                  className="w-full"
                  size="lg"
                  variant="premium"
                >
                  {isSubmitting ? "Declaring Winner..." : "Declare Winner & Distribute Prize"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default TournamentResults;
