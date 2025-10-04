import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTournaments } from "@/hooks/useTournaments";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

const TournamentManagement = () => {
  const navigate = useNavigate();
  const { data: tournaments, isLoading } = useTournaments();

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

  return (
    <MainLayout>
      <PageHeader 
        title="Tournament Management"
        showBack={true}
        subtitle="Create and manage tournaments"
      />

      <div className="mb-6">
        <Button variant="premium" onClick={() => navigate("/admin/tournaments/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Trophy className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold">{tournament.name}</h3>
                    <Badge className={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Slots:</span>
                  <span className="font-semibold">
                    {tournament.filled_slots}/{tournament.total_slots}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Entry:</span>
                  <span className="font-semibold">₹{tournament.entry_fee}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {format(new Date(tournament.start_date), "PPp")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/admin/tournaments/${tournament.id}/results`)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Results
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No tournaments yet</p>
          <Button 
            variant="premium" 
            className="mt-4"
            onClick={() => navigate("/admin/tournaments/create")}
          >
            Create Your First Tournament
          </Button>
        </Card>
      )}
    </MainLayout>
  );
};

export default TournamentManagement;
