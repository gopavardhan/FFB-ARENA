import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTournaments, useUserRegistrations } from "@/hooks/useTournaments";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Users, Calendar, DollarSign, Search, Clock, Star, Zap, Play, CheckCircle, Timer, Award, Target, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { format, differenceInMinutes, differenceInSeconds, isToday, isTomorrow, isPast } from "date-fns";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useRealtimeTournaments } from "@/hooks/useRealtimeTournaments";
import { useTournamentStatusUpdater } from "@/hooks/useTournamentStatusUpdater";
import { useWinnerDetection } from "@/hooks/useWinnerDetection";

// Timer component for live countdown
const LiveTimer = ({ startDate, onTimeUp }: { startDate: string; onTimeUp?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const difference = start - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null);
        onTimeUp?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startDate, onTimeUp]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
      <Timer className="w-4 h-4 text-blue-400 animate-pulse" />
      <div className="flex items-center gap-1 text-sm font-mono">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">
              {timeLeft.days.toString().padStart(2, '0')}
            </span>
            <span className="text-blue-400">d</span>
          </>
        )}
        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">
          {timeLeft.hours.toString().padStart(2, '0')}
        </span>
        <span className="text-blue-400">:</span>
        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-blue-400">:</span>
        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold animate-pulse">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

const Tournaments = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Enable real-time subscriptions for tournament updates
  useRealtimeTournaments();
  
  // Enable automatic tournament status updates
  useTournamentStatusUpdater();
  
  // Enable real-time winner detection with automatic tab switching
  useWinnerDetection((tournamentId) => {
    console.log(`Winner detected for tournament ${tournamentId}, switching to completed tab`);
    if (activeTab === "ongoing") {
      setActiveTab("completed");
    }
  });
  
  const { data: allTournaments, isLoading } = useTournaments();
  const { data: userRegistrations } = useUserRegistrations(user?.id || "");

  // Update current time every second for real-time status checking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTournamentClick = (tournamentId: string) => {
    navigate(`/tournaments/${tournamentId}`);
  };

  const isRegistered = (tournamentId: string) => {
    return userRegistrations?.some((reg) => reg.tournament_id === tournamentId);
  };

  const getTotalPrizePool = (prizeDistribution: any) => {
    if (!prizeDistribution || typeof prizeDistribution !== 'object') return 0;
    return Object.values(prizeDistribution).reduce((sum: number, prize: any) => sum + (Number(prize) || 0), 0);
  };

  // Function to determine real-time tournament status based on current time and winner data
  const getRealTimeStatus = (tournament: any) => {
    const now = currentTime.getTime();
    const startTime = new Date(tournament.start_date).getTime();
    const minutesSinceStart = (now - startTime) / (1000 * 60);
    
    // If tournament has been active for 20+ minutes, it should be completed
    if (tournament.status === 'active' && minutesSinceStart >= 20) {
      return 'completed';
    }
    
    // If tournament has a winner but database still shows 'active', it should be 'completed'
    // Check for winner_id (database field) or winner_user_id/winner_details (legacy fields)
    if (tournament.status === 'active' && (tournament.winner_id || tournament.winner_user_id || tournament.winner_details)) {
      return 'completed';
    }
    
    // If tournament has passed start time but database still shows 'upcoming', it should be 'active'
    if (tournament.status === 'upcoming' && now >= startTime) {
      return 'active';
    }
    
    // Return the database status for all other cases
    return tournament.status;
  };

  // Categorize tournaments by real-time status (not just database status)
  const upcomingTournaments = allTournaments?.filter(t => {
    const realTimeStatus = getRealTimeStatus(t);
    return realTimeStatus === 'upcoming' && 
           t.name.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()) || [];

  const ongoingTournaments = allTournaments?.filter(t => {
    const realTimeStatus = getRealTimeStatus(t);
    return realTimeStatus === 'active' && 
           t.name.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()) || [];

  const completedTournaments = allTournaments?.filter(t => {
    const realTimeStatus = getRealTimeStatus(t);
    return realTimeStatus === 'completed' && 
           t.name.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()) || [];

  // Auto-switch to ongoing tab when tournaments start
  useEffect(() => {
    if (activeTab === "upcoming" && ongoingTournaments.length > 0) {
      // Check if any tournament just started (within the last 10 seconds)
      const justStartedTournaments = ongoingTournaments.filter(t => {
        const startTime = new Date(t.start_date).getTime();
        const timeDiff = currentTime.getTime() - startTime;
        return timeDiff >= 0 && timeDiff <= 10000; // Within 10 seconds of start
      });

      if (justStartedTournaments.length > 0) {
        setActiveTab("ongoing");
      }
    }
  }, [ongoingTournaments, activeTab, currentTime]);

  // Auto-switch to completed tab when tournaments are completed (20 minutes elapsed or winner posted)
  useEffect(() => {
    if (activeTab === "ongoing" && completedTournaments.length > 0) {
      // Check if any tournament just completed
      const justCompletedTournaments = allTournaments?.filter(t => {
        const realTimeStatus = getRealTimeStatus(t);
        const now = currentTime.getTime();
        const startTime = new Date(t.start_date).getTime();
        const minutesSinceStart = (now - startTime) / (1000 * 60);
        
        // Tournament just completed if:
        // 1. Real-time status is completed AND database status is still active
        // 2. Either 20 minutes have passed OR winner was posted
        return realTimeStatus === 'completed' && 
               t.status === 'active' && 
               (minutesSinceStart >= 20 || t.winner_id || t.winner_user_id || t.winner_details);
      }) || [];

      if (justCompletedTournaments.length > 0) {
        setActiveTab("completed");
      }
    }
  }, [completedTournaments, activeTab, allTournaments, currentTime]);

  // Upcoming Tournament Card
  const renderUpcomingCard = (tournament: any) => {
    const totalPrize = getTotalPrizePool(tournament.prize_distribution);
    const slotsRemaining = tournament.total_slots - tournament.filled_slots;
    const registered = isRegistered(tournament.id);
    const minutesUntilStart = differenceInMinutes(new Date(tournament.start_date), new Date());
    const isUrgent = minutesUntilStart < 60;
    const isAlmostFull = slotsRemaining <= 3;

    return (
      <Card 
        key={tournament.id} 
        className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
          registered ? 'ring-2 ring-secondary/50 bg-gradient-to-br from-secondary/5 to-accent/5' : 
          isUrgent ? 'ring-2 ring-red-500/50 bg-gradient-to-br from-red-500/5 to-orange-500/5 animate-pulse' :
          isAlmostFull ? 'ring-2 ring-orange-500/50 bg-gradient-to-br from-orange-500/5 to-yellow-500/5' :
          'bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:ring-2 hover:ring-blue-500/30'
        }`}
        onClick={() => handleTournamentClick(tournament.id)}
      >
        {/* Status indicators */}
        {isUrgent && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              Starting Soon!
            </Badge>
          </div>
        )}
        {isAlmostFull && !isUrgent && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              <Star className="w-3 h-3 mr-1" />
              Almost Full
            </Badge>
          </div>
        )}
        {registered && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-secondary/20 text-secondary border-secondary/30">
              <Trophy className="w-3 h-3 mr-1" />
              Registered
            </Badge>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-orbitron font-bold text-lg truncate group-hover:text-blue-400 transition-colors">
                {tournament.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Upcoming
                </Badge>
                {tournament.tournament_type && (
                  <Badge variant="outline" className="text-xs">
                    {tournament.tournament_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Live Timer */}
          <div className="mb-4">
            <LiveTimer startDate={tournament.start_date} />
          </div>

          {/* Tournament Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">Entry:</span>
                <span className="font-bold text-secondary">₹{tournament.entry_fee}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Prize:</span>
                <span className="font-bold text-accent">₹{totalPrize}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Slots:</span>
                <span className={`font-bold ${slotsRemaining <= 3 ? 'text-orange-400' : 'text-foreground'}`}>
                  {tournament.filled_slots}/{tournament.total_slots}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {format(new Date(tournament.start_date), "MMM dd, HH:mm")}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Slots filled</span>
              <span>{Math.round((tournament.filled_slots / tournament.total_slots) * 100)}%</span>
            </div>
            <div className="w-full bg-blue-500/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  tournament.filled_slots / tournament.total_slots > 0.8 ? 'bg-orange-500' :
                  tournament.filled_slots / tournament.total_slots > 0.6 ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${(tournament.filled_slots / tournament.total_slots) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          {registered ? (
            <Button variant="outline" className="w-full bg-secondary/10 border-secondary/30 text-secondary" disabled>
              <Trophy className="w-4 h-4 mr-2" />
              Registered
            </Button>
          ) : tournament.filled_slots >= tournament.total_slots ? (
            <Button variant="outline" className="w-full" disabled>
              Tournament Full
            </Button>
          ) : (
            <Button 
              variant="premium" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tournaments/${tournament.id}`);
              }}
            >
              Join Tournament
            </Button>
          )}
        </div>
      </Card>
    );
  };

  // Ongoing Tournament Card
  const renderOngoingCard = (tournament: any) => {
    const totalPrize = getTotalPrizePool(tournament.prize_distribution);
    const registered = isRegistered(tournament.id);

    return (
      <Card 
        key={tournament.id} 
        className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
          registered ? 'ring-2 ring-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10' : 
          'bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:ring-2 hover:ring-green-500/30'
        }`}
        onClick={() => handleTournamentClick(tournament.id)}
      >
        {/* Live indicator */}
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
            <Play className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </div>
        
        {registered && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-secondary/20 text-secondary border-secondary/30">
              <Trophy className="w-3 h-3 mr-1" />
              Participating
            </Badge>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
              <Play className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-orbitron font-bold text-lg truncate group-hover:text-green-400 transition-colors">
                {tournament.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Ongoing
                </Badge>
                {tournament.tournament_type && (
                  <Badge variant="outline" className="text-xs">
                    {tournament.tournament_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Live Status */}
          <div className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">Tournament in Progress</span>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">Entry:</span>
                <span className="font-bold text-secondary">₹{tournament.entry_fee}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Prize:</span>
                <span className="font-bold text-accent">₹{totalPrize}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Players:</span>
                <span className="font-bold text-foreground">
                  {tournament.filled_slots}/{tournament.total_slots}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Started: {format(new Date(tournament.start_date), "HH:mm")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            variant="outline" 
            className="w-full bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tournaments/${tournament.id}`);
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            View Live Tournament
          </Button>
        </div>
      </Card>
    );
  };

  // Completed Tournament Card
  const renderCompletedCard = (tournament: any) => {
    const totalPrize = getTotalPrizePool(tournament.prize_distribution);
    const registered = isRegistered(tournament.id);

    return (
      <Card 
        key={tournament.id} 
        className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
          registered ? 'ring-2 ring-purple-500/50 bg-gradient-to-br from-purple-500/10 to-indigo-500/10' : 
          'bg-gradient-to-br from-gray-500/5 to-slate-500/5 hover:ring-2 hover:ring-purple-500/30'
        }`}
        onClick={() => handleTournamentClick(tournament.id)}
      >
        {/* Completed indicator */}
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        </div>
        
        {registered && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-secondary/20 text-secondary border-secondary/30">
              <Crown className="w-3 h-3 mr-1" />
              Participated
            </Badge>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-orbitron font-bold text-lg truncate group-hover:text-purple-400 transition-colors">
                {tournament.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  Completed
                </Badge>
                {tournament.tournament_type && (
                  <Badge variant="outline" className="text-xs">
                    {tournament.tournament_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">Entry:</span>
                <span className="font-bold text-secondary">₹{tournament.entry_fee}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Prize:</span>
                <span className="font-bold text-accent">₹{totalPrize}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Players:</span>
                <span className="font-bold text-foreground">
                  {tournament.filled_slots}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {format(new Date(tournament.start_date), "MMM dd, HH:mm")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            variant="outline" 
            className="w-full bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tournaments/${tournament.id}`);
            }}
          >
            <Award className="w-4 h-4 mr-2" />
            View Results
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Tournaments"
        showBack={true}
        subtitle="Browse tournaments by status"
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tournament Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming
            {upcomingTournaments.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {upcomingTournaments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Ongoing
            {ongoingTournaments.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs bg-green-500/20 text-green-400">
                {ongoingTournaments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed
            {completedTournaments.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {completedTournaments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tournaments */}
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : upcomingTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTournaments.map(renderUpcomingCard)}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No upcoming tournaments</h3>
              <p className="text-sm">Check back later for new tournaments.</p>
            </div>
          )}
        </TabsContent>

        {/* Ongoing Tournaments */}
        <TabsContent value="ongoing">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : ongoingTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingTournaments.map(renderOngoingCard)}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No ongoing tournaments</h3>
              <p className="text-sm">Tournaments will appear here when they start.</p>
            </div>
          )}
        </TabsContent>

        {/* Completed Tournaments */}
        <TabsContent value="completed">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : completedTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTournaments.map(renderCompletedCard)}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No completed tournaments</h3>
              <p className="text-sm">Completed tournaments will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Tournaments;