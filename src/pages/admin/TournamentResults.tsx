import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTournament } from "@/hooks/useTournaments";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { Trophy, ArrowLeft } from "lucide-react";

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
  const [results, setResults] = useState<Record<string, { rank: number; kills: number; prize: number }>>({});

  const { data: registrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: ["tournament_registrations_full", id],
    queryFn: async () => {
      const { data: regs, error: regsError } = await supabase
        .from("tournament_registrations")
        .select("*")
        .eq("tournament_id", id!);

      if (regsError) throw regsError;

      // Fetch profiles separately
      const userIds = regs.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Merge data
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

  const handleResultChange = (userId: string, field: "rank" | "kills" | "prize", value: string) => {
    setResults((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        rank: prev[userId]?.rank || 0,
        kills: prev[userId]?.kills || 0,
        prize: prev[userId]?.prize || 0,
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Update results in database
      const resultEntries = Object.entries(results).map(([userId, result]) => ({
        tournament_id: id,
        user_id: userId,
        rank: result.rank,
        kills: result.kills,
        prize_amount: result.prize,
      }));

      // Delete existing results
      await supabase.from("tournament_results").delete().eq("tournament_id", id!);

      // Insert new results
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

      // Distribute prizes (this will update balances)
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Enter Results for Each Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {registrations?.map((reg) => (
              <Card key={reg.id} className="p-4 bg-secondary/5">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{reg.profiles.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{reg.profiles.email}</p>
                    <p className="text-sm text-secondary font-semibold mt-1">
                      In-Game: {reg.in_game_name}
                      {reg.friend_in_game_name && ` & ${reg.friend_in_game_name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Slot #{reg.slot_number}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Rank</Label>
                      <Input
                        type="number"
                        placeholder="Enter rank"
                        value={results[reg.user_id]?.rank || ""}
                        onChange={(e) => handleResultChange(reg.user_id, "rank", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Kills</Label>
                      <Input
                        type="number"
                        placeholder="Enter kills"
                        value={results[reg.user_id]?.kills || ""}
                        onChange={(e) => handleResultChange(reg.user_id, "kills", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Prize Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Enter prize"
                        value={results[reg.user_id]?.prize || ""}
                        onChange={(e) => handleResultChange(reg.user_id, "prize", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(results).length === 0}
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