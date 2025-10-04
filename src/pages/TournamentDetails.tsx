import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTournament, useRegisterTournament, useUserRegistrations } from "@/hooks/useTournaments";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Users, Calendar, DollarSign, Award, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

const TournamentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: tournament, isLoading } = useTournament(id || "");
  const { data: userRegistrations } = useUserRegistrations(user?.id || "");
  const registerMutation = useRegisterTournament();

  const isRegistered = userRegistrations?.some((reg) => reg.tournament_id === id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "completed":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  const handleRegister = () => {
    if (user && id) {
      registerMutation.mutate({ tournamentId: id, userId: user.id });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!tournament) {
    return (
      <MainLayout>
        <Card className="p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Tournament not found</p>
          <Button className="mt-4" onClick={() => navigate("/tournaments")}>
            Back to Tournaments
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Button variant="outline" className="mb-4" onClick={() => navigate("/tournaments")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tournaments
      </Button>

      <PageHeader 
        title={tournament.name} 
        subtitle={`Tournament Details - ${tournament.game_mode || "Squad"}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-orbitron font-bold">Tournament Information</h3>
              <Badge className={getStatusColor(tournament.status)}>
                {tournament.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Entry Fee</p>
                  <p className="font-semibold">₹{tournament.entry_fee}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Slots</p>
                  <p className="font-semibold">
                    {tournament.filled_slots}/{tournament.total_slots}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-semibold">
                    {format(new Date(tournament.start_date), "PPp")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Game Mode</p>
                  <p className="font-semibold">{tournament.game_mode || "Squad"}</p>
                </div>
              </div>
            </div>

            {isRegistered && tournament.room_id && (
              <div className="mt-6 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                <h4 className="font-semibold mb-2">Room Details</h4>
                <div className="space-y-1">
                  <p className="text-sm">Room ID: <span className="font-mono font-bold">{tournament.room_id}</span></p>
                  {tournament.room_password && (
                    <p className="text-sm">Password: <span className="font-mono font-bold">{tournament.room_password}</span></p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {tournament.tournament_rules && (
            <Card className="p-6">
              <h3 className="text-xl font-orbitron font-bold mb-4">Tournament Rules</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{tournament.tournament_rules}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" />
              Prize Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(tournament.prize_distribution as Record<string, number>).map(([rank, prize]) => (
                <div key={rank} className="flex items-center justify-between p-3 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg">
                  <span className="font-semibold">#{rank} Position</span>
                  <span className="text-lg font-bold text-gradient">₹{prize}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            {isRegistered ? (
              <div className="text-center space-y-4">
                <Badge variant="outline" className="text-green-500 border-green-500">
                  ✓ You're Registered
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Good luck in the tournament!
                </p>
              </div>
            ) : tournament.filled_slots >= tournament.total_slots ? (
              <Button variant="outline" className="w-full" disabled>
                Tournament Full
              </Button>
            ) : tournament.status === "upcoming" ? (
              <Button 
                variant="premium" 
                className="w-full"
                onClick={handleRegister}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registering..." : `Join Tournament (₹${tournament.entry_fee})`}
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Registration Closed
              </Button>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TournamentDetails;
