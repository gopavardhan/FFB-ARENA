import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminTournaments, useDeleteTournament } from "@/hooks/useTournaments";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Calendar, Plus, CreditCard as Edit, Key, Trash2, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { RoomCredentials } from "./RoomCredentials";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TournamentManagement = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { data: tournaments, isLoading } = useAdminTournaments(user?.id || "");
  
    const deleteTournament = useDeleteTournament();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (tournament: { id: string; name: string }) => {
    setTournamentToDelete(tournament);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tournamentToDelete || !user) return;

    await deleteTournament.mutateAsync({
      tournamentId: tournamentToDelete.id,
      userId: user.id,
    });

    setDeleteDialogOpen(false);
    setTournamentToDelete(null);
  };

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

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/admin/tournaments/${tournament.id}/slots`)}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  View Slots
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTournamentId(tournament.id)}
                >
                  <Key className="w-4 h-4 mr-1" />
                  Room Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/tournaments/${tournament.id}/results`)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Results
                </Button>
                {tournament.status !== "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick({ id: tournament.id, name: tournament.name })}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
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

      <RoomCredentials
        tournamentId={selectedTournamentId || ""}
        open={!!selectedTournamentId}
        onOpenChange={(open) => !open && setSelectedTournamentId(null)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{tournamentToDelete?.name}"?
              <br /><br />
              <strong>All registered players will be automatically refunded their entry fee.</strong>
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete & Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default TournamentManagement;
