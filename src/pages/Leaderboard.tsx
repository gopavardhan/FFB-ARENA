import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

const Leaderboard = () => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // Get top players based on tournament winnings
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select(`
          user_id,
          prize_amount,
          profiles!inner(full_name, email)
        `)
        .not("prize_amount", "is", null)
        .order("prize_amount", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Aggregate winnings by user
      const userWinnings = data.reduce((acc: any, reg: any) => {
        const userId = reg.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            full_name: reg.profiles.full_name,
            email: reg.profiles.email,
            total_winnings: 0,
            tournament_wins: 0,
          };
        }
        acc[userId].total_winnings += parseFloat(String(reg.prize_amount) || "0");
        if (Number(reg.prize_amount) > 0) {
          acc[userId].tournament_wins += 1;
        }
        return acc;
      }, {});

      return Object.values(userWinnings).sort((a: any, b: any) => b.total_winnings - a.total_winnings);
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="font-orbitron font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-br from-amber-700/20 to-amber-800/10 border-amber-700/30";
      default:
        return "bg-gradient-to-br from-card to-card/50";
    }
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Leaderboard" 
        subtitle="Top players and rankings"
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((player: any, index: number) => (
            <Card 
              key={player.user_id} 
              className={`p-4 transition-all hover:shadow-lg ${getRankBgColor(index + 1)}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(index + 1)}
                </div>
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-secondary/20 text-secondary font-bold">
                    {player.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{player.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{player.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-orbitron font-bold text-gradient">
                    ₹{player.total_winnings.toFixed(2)}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {player.tournament_wins} Wins
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No leaderboard data yet</p>
        </Card>
      )}
    </MainLayout>
  );
};

export default Leaderboard;
