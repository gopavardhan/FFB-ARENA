import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRegistrations } from "@/hooks/useTournaments";
import { Trophy, Calendar, Award, Users } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

const History = () => {
  const { user } = useAuth();
  const { data: registrations, isLoading } = useUserRegistrations(user?.id || "");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "completed":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  const totalEarnings = registrations
    ?.filter((reg) => reg.prize_amount)
    ?.reduce((sum, reg) => sum + parseFloat(String(reg.prize_amount) || "0"), 0) || 0;

  const completedTournaments = registrations
    ?.filter((reg) => reg.tournaments.status === "completed")?.length || 0;

  return (
    <MainLayout>
      <PageHeader 
        title="Match History" 
        subtitle="Your tournament participation and results"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-secondary/20">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Tournaments</p>
              <h3 className="text-2xl font-orbitron font-bold">{registrations?.length || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-orbitron font-bold">{completedTournaments}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-secondary/20">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <h3 className="text-2xl font-orbitron font-bold text-gradient">
                ₹{totalEarnings.toFixed(2)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Tournament History */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : registrations && registrations.length > 0 ? (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <Card key={registration.id} className="p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Trophy className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold">{registration.tournaments.name}</h3>
                    <Badge className={getStatusColor(registration.tournaments.status)}>
                      {registration.tournaments.status}
                    </Badge>
                  </div>
                </div>
                {registration.rank && (
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      Rank #{registration.rank}
                    </Badge>
                    {registration.prize_amount && (
                      <p className="text-lg font-bold text-green-500">
                        +₹{Number(registration.prize_amount).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Tournament Date</p>
                    <p className="font-semibold">
                      {format(new Date(registration.tournaments.start_date), "PP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Participants</p>
                    <p className="font-semibold">{registration.tournaments.filled_slots}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Entry Fee</p>
                    <p className="font-semibold">₹{registration.tournaments.entry_fee}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No tournament history yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Join your first tournament to get started!
          </p>
        </Card>
      )}
    </MainLayout>
  );
};

export default History;
