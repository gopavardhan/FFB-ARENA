import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTournaments, useUserRegistrations } from "@/hooks/useTournaments";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Users, Calendar, DollarSign, Search } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useRealtimeTournaments } from "@/hooks/useRealtimeTournaments";

const Tournaments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "active" | "completed">("all");
  
  // Enable real-time subscriptions for tournament updates
  useRealtimeTournaments();
  
  const { data: tournaments, isLoading } = useTournaments(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const { data: userRegistrations } = useUserRegistrations(user?.id || "");

  const filteredTournaments = tournaments?.filter((tournament) =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isRegistered = (tournamentId: string) => {
    return userRegistrations?.some((reg) => reg.tournament_id === tournamentId);
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
        title="Tournaments" 
        subtitle="Browse and join upcoming tournaments"
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tournaments</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tournaments Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredTournaments && filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Card 
              key={tournament.id} 
              className="p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/tournaments/${tournament.id}`)}
            >
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
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Entry Fee:</span>
                  <span className="font-semibold">₹{tournament.entry_fee}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Slots:</span>
                  <span className="font-semibold">
                    {tournament.filled_slots}/{tournament.total_slots}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {format(new Date(tournament.start_date), "PPp")}
                  </span>
                </div>
              </div>

              {isRegistered(tournament.id) ? (
                <Button variant="outline" className="w-full" disabled onClick={(e) => e.stopPropagation()}>
                  Already Registered
                </Button>
              ) : tournament.filled_slots >= tournament.total_slots ? (
                <Button variant="outline" className="w-full" disabled onClick={(e) => e.stopPropagation()}>
                  Tournament Full
                </Button>
              ) : (
                <Button 
                  variant="premium" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tournaments/${tournament.id}`);
                  }}
                >
                  View Details
                </Button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tournaments found</p>
        </div>
      )}
    </MainLayout>
  );
};

export default Tournaments;
