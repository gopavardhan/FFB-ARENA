import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, Zap, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInMinutes } from "date-fns";

interface Tournament {
  id: string;
  name: string;
  start_date: string;
  entry_fee: number;
  filled_slots: number;
  total_slots: number;
  status: string;
}

interface TournamentNotificationsProps {
  tournaments: Tournament[];
  userRegistrations: any[];
}

export const TournamentNotifications = ({ tournaments, userRegistrations }: TournamentNotificationsProps) => {
  const navigate = useNavigate();
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  const isRegistered = (tournamentId: string) => {
    return userRegistrations?.some((reg) => reg.tournament_id === tournamentId);
  };

  const getUrgentTournaments = () => {
    if (!tournaments) return [];
    
    return tournaments.filter(tournament => {
      if (dismissedNotifications.includes(tournament.id)) return false;
      if (isRegistered(tournament.id)) return false;
      
      const minutesUntilStart = differenceInMinutes(new Date(tournament.start_date), new Date());
      const slotsRemaining = tournament.total_slots - tournament.filled_slots;
      
      // Show urgent notifications for tournaments starting within 2 hours or almost full
      return (minutesUntilStart < 120 && minutesUntilStart > 0 && slotsRemaining > 0) ||
             (slotsRemaining <= 5 && slotsRemaining > 0);
    });
  };

  const urgentTournaments = getUrgentTournaments();

  const dismissNotification = (tournamentId: string) => {
    setDismissedNotifications(prev => [...prev, tournamentId]);
  };

  if (urgentTournaments.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {urgentTournaments.map(tournament => {
        const minutesUntilStart = differenceInMinutes(new Date(tournament.start_date), new Date());
        const slotsRemaining = tournament.total_slots - tournament.filled_slots;
        const isStartingSoon = minutesUntilStart < 120;
        const isAlmostFull = slotsRemaining <= 5;

        return (
          <Card 
            key={tournament.id}
            className={`p-4 border-l-4 ${
              isStartingSoon 
                ? 'border-l-red-500 bg-gradient-to-r from-red-500/10 to-orange-500/5' 
                : 'border-l-orange-500 bg-gradient-to-r from-orange-500/10 to-yellow-500/5'
            } animate-pulse`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  isStartingSoon ? 'bg-red-500/20' : 'bg-orange-500/20'
                }`}>
                  {isStartingSoon ? (
                    <Zap className="w-5 h-5 text-red-400" />
                  ) : (
                    <Trophy className="w-5 h-5 text-orange-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{tournament.name}</h4>
                    {isStartingSoon && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Starting Soon!
                      </Badge>
                    )}
                    {isAlmostFull && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        Almost Full
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {isStartingSoon 
                        ? `${Math.floor(minutesUntilStart / 60)}h ${minutesUntilStart % 60}m left`
                        : format(new Date(tournament.start_date), "MMM dd, HH:mm")
                      }
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {slotsRemaining} slots left
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isStartingSoon 
                      ? "⚡ Don't miss out! Tournament starting very soon."
                      : "🔥 Limited slots remaining. Join now!"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="premium"
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                  className="text-xs"
                >
                  Join Now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissNotification(tournament.id)}
                  className="text-xs p-1 h-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};