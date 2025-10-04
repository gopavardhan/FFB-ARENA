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
import { Trophy, ArrowLeft } from "lucide-react";
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
      // Delete existing results
      await supabase.from("tournament_results").delete().eq("tournament_id", id!);

      // Create result for winner
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

      // Update tournament status to completed
      const { error: tournamentError } = await supabase
        .from("tournaments")
        .update({ status: "completed" })
        .eq("id", id!);

      if (tournamentError) throw tournamentError;

      // Distribute prizes using the RPC function
      const { data: prizeData, error: prizeError } = await supabase.rpc(
        "distribute_tournament_prizes",
        {
          p_tournament_id: id!,
          p_admin_id: (await supabase.auth.getUser()).data.user?.id,
        }
      );

      if (prizeError) throw prizeError;

      const totalDistributed = typeof prizeData === 'object' && prizeData && 'total_distributed' in prizeData 
        ? prizeData.total_distributed 
        : 0;

      toast({
        title: "Success",
        description: `Winner declared! Prize of ₹${totalDistributed} credited to winner's account.`,
      });

      navigate("/admin/tournaments");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
            Select the Winner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-3 block">
                Choose the tournament winner
              </Label>
              <Select
                value={winnerId}
                onValueChange={setWinnerId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select winner from participants" />
                </SelectTrigger>
                <SelectContent>
                  {registrations?.map((reg) => (
                    <SelectItem key={reg.user_id} value={reg.user_id}>
                      <div className="flex flex-col py-2">
                        <span className="font-semibold text-base">
                          {reg.in_game_name || reg.profiles.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Slot #{reg.slot_number} • {reg.profiles.email}
                        </span>
                        {reg.friend_in_game_name && (
                          <span className="text-xs text-muted-foreground">
                            Partner: {reg.friend_in_game_name}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !winnerId}
              className="w-full"
              size="lg"
              variant="premium"
            >
              {isSubmitting ? "Declaring Winner..." : "Declare Winner & Distribute Prize"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default TournamentResults;
