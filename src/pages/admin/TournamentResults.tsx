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
  const [winners, setWinners] = useState<Record<number, string>>({});

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
  const positions = Object.keys(prizeDistribution).sort((a, b) => parseInt(a) - parseInt(b));

  const handleWinnerChange = (position: number, userId: string) => {
    setWinners(prev => ({
      ...prev,
      [position]: userId
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate all positions are filled
      const missingPositions = positions.filter(pos => !winners[parseInt(pos)]);
      if (missingPositions.length > 0) {
        toast({
          title: "Error",
          description: `Please select winners for all positions: ${missingPositions.join(", ")}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Delete existing results
      await supabase.from("tournament_results").delete().eq("tournament_id", id!);

      // Create results with prize amounts from prize distribution
      const resultEntries = Object.entries(winners).map(([position, userId]) => ({
        tournament_id: id,
        user_id: userId,
        rank: parseInt(position),
        kills: 0,
        prize_amount: prizeDistribution[position] || 0,
      }));

      const { error: resultsError } = await supabase
        .from("tournament_results")
        .insert(resultEntries);

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
        description: `Results posted successfully! Total distributed: ₹${totalDistributed}`,
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
        title="Post Tournament Results"
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
          <CardTitle>Prize Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {positions.map(pos => (
              <div key={pos} className="p-4 bg-secondary/10 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Position {pos}</div>
                <div className="text-2xl font-bold text-secondary">₹{prizeDistribution[pos]}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Select Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {positions.map(pos => {
              const position = parseInt(pos);
              return (
                <div key={position} className="p-4 border border-border rounded-lg">
                  <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-secondary" />
                    Position {position} - ₹{prizeDistribution[pos]}
                  </Label>
                  <Select
                    value={winners[position] || ""}
                    onValueChange={(value) => handleWinnerChange(position, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {registrations?.map((reg) => (
                        <SelectItem key={reg.user_id} value={reg.user_id}>
                          <div className="flex flex-col">
                            <span className="font-semibold">{reg.in_game_name || reg.profiles.full_name}</span>
                            <span className="text-xs text-muted-foreground">
                              Slot #{reg.slot_number} • {reg.profiles.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(winners).length === 0}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Posting Results..." : "Post Results & Distribute Prizes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default TournamentResults;
