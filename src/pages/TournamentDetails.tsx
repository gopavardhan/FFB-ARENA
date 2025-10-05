import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTournament, useRegisterTournament, useUserRegistrations } from "@/hooks/useTournaments";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Users, Calendar, DollarSign, Award, ArrowLeft, AlertCircle } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const TournamentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: tournament, isLoading } = useTournament(id || "");
  const { data: userRegistrations } = useUserRegistrations(user?.id || "");
  const registerMutation = useRegisterTournament();
  
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [inGameName, setInGameName] = useState("");
  const [friendInGameName, setFriendInGameName] = useState("");
  // For squad mode, allow multiple partner names
  const [squadPartner1, setSquadPartner1] = useState("");
  const [squadPartner2, setSquadPartner2] = useState("");
  const [squadPartner3, setSquadPartner3] = useState("");

  const isRegistered = userRegistrations?.some((reg) => reg.tournament_id === id);
  const myRegistration = userRegistrations?.find((reg) => reg.tournament_id === id);

  // Fetch room credentials for registered users
  const { data: credentials } = useQuery({
    queryKey: ["tournament-credentials", id],
    queryFn: async () => {
      if (!id || !isRegistered) return null;
      
      const { data, error } = await supabase
        .from("tournament_credentials")
        .select("*")
        .eq("tournament_id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!isRegistered,
  });

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
    if (!user?.id) return;
    
    if (!inGameName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your in-game name",
        variant: "destructive",
      });
      return;
    }

    // Prepare friendInGameName depending on game mode
    let friendPayload: string | undefined | null = null;
    const mode = tournament?.game_mode || "Squad";
    if (mode === "Duo") {
      friendPayload = friendInGameName.trim() || null;
    } else if (mode === "Squad") {
      const partners = [squadPartner1.trim(), squadPartner2.trim(), squadPartner3.trim()].filter(Boolean);
      friendPayload = partners.length > 0 ? JSON.stringify(partners) : null;
    } else {
      friendPayload = null;
    }

    registerMutation.mutate({
      tournamentId: id!,
      userId: user.id,
      inGameName: inGameName.trim(),
      friendInGameName: friendPayload,
    }, {
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: `Registered successfully! Your slot number is ${data.slot_number}`,
        });
        setShowRegisterDialog(false);
        setInGameName("");
        setFriendInGameName("");
      }
    });
  };

  const minutesUntilStart = tournament ? differenceInMinutes(new Date(tournament.start_date), new Date()) : 0;
  const showRoomDetails = isRegistered && credentials && minutesUntilStart <= 5 && (credentials.room_id || credentials.room_password);
  const showRoomPending = isRegistered && minutesUntilStart > 5;

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
        showBack={true}
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
              {tournament.tournament_type && (
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tournament Type</p>
                    <p className="font-semibold">{tournament.tournament_type}</p>
                  </div>
                </div>
              )}
            </div>

            {myRegistration && (
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <h4 className="font-semibold mb-2">Your Registration Details</h4>
                <div className="space-y-1 text-sm">
                  <p>In-Game Name: <span className="font-bold text-secondary">{myRegistration.in_game_name}</span></p>
                  {myRegistration.friend_in_game_name && (() => {
                    let parsed: string[] | null = null;
                    try {
                      const p = JSON.parse(myRegistration.friend_in_game_name);
                      if (Array.isArray(p)) parsed = p;
                    } catch (err) {
                      parsed = null;
                    }

                    if (parsed) {
                      return <p>Partners: <span className="font-bold text-secondary">{parsed.join(", ")}</span></p>;
                    }

                    return <p>Friend's Name: <span className="font-bold text-secondary">{myRegistration.friend_in_game_name}</span></p>;
                  })()}
                  <p>Slot Number: <span className="font-bold text-secondary">#{myRegistration.slot_number}</span></p>
                </div>
              </div>
            )}

            {showRoomDetails ? (
              <div className="mt-6 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Room Details
                </h4>
                <div className="space-y-1">
                  {credentials.room_id && (
                    <p className="text-sm">Room ID: <span className="font-mono font-bold text-secondary">{credentials.room_id}</span></p>
                  )}
                  {credentials.room_password && (
                    <p className="text-sm">Password: <span className="font-mono font-bold text-secondary">{credentials.room_password}</span></p>
                  )}
                </div>
              </div>
            ) : showRoomPending && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-500 mb-1">Room Details Coming Soon</h4>
                    <p className="text-sm text-muted-foreground">
                      Room ID and password will be available here 5 minutes before the match starts.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Time until available: {Math.max(0, minutesUntilStart - 5)} minutes
                    </p>
                  </div>
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
                onClick={() => setShowRegisterDialog(true)}
              >
                Join Tournament (₹{tournament.entry_fee})
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Registration Closed
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Tournament</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inGameName">Your In-Game Name *</Label>
              <Input
                id="inGameName"
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                placeholder="Enter your Free Fire in-game name"
                maxLength={50}
              />
            </div>
            {tournament?.game_mode === "Duo" && (
              <div>
                <Label htmlFor="friendInGameName">Partner's In-Game Name *</Label>
                <Input
                  id="friendInGameName"
                  value={friendInGameName}
                  onChange={(e) => setFriendInGameName(e.target.value)}
                  placeholder="Enter your partner's in-game name"
                  maxLength={50}
                />
              </div>
            )}

            {tournament?.game_mode === "Squad" && (
              <div className="space-y-2">
                <Label>Squad Partners (Optional, up to 3)</Label>
                <Input
                  placeholder="Partner 1 in-game name"
                  value={squadPartner1}
                  onChange={(e) => setSquadPartner1(e.target.value)}
                />
                <Input
                  placeholder="Partner 2 in-game name"
                  value={squadPartner2}
                  onChange={(e) => setSquadPartner2(e.target.value)}
                />
                <Input
                  placeholder="Partner 3 in-game name"
                  value={squadPartner3}
                  onChange={(e) => setSquadPartner3(e.target.value)}
                />
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Entry Fee: <span className="font-bold text-secondary">₹{tournament.entry_fee}</span>
            </div>
            <Button
              onClick={handleRegister}
              disabled={registerMutation.isPending}
              className="w-full"
            >
              {registerMutation.isPending ? "Registering..." : "Confirm Registration"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TournamentDetails;