import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, TrendingUp } from "lucide-react";
import { TeamWithMembers } from "@/types/features";
import { useNavigate } from "react-router-dom";

interface TeamCardProps {
  team: TeamWithMembers;
  onJoin?: (teamId: string) => void;
  onLeave?: (teamId: string) => void;
  isUserMember?: boolean;
  isLoading?: boolean;
}

export const TeamCard = ({ team, onJoin, onLeave, isUserMember, isLoading }: TeamCardProps) => {
  const navigate = useNavigate();
  const memberCount = team.members?.length || 0;
  const maxMembers = 4;
  const hasOpenSlots = memberCount < maxMembers;

  return (
    <Card className="p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/teams/${team.id}`)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{team.name}</h3>
            {team.tag && (
              <Badge variant="secondary">[{team.tag}]</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Captain: {team.captain?.username || 'Unknown'}
          </p>
        </div>
        <Badge variant={hasOpenSlots ? "default" : "secondary"}>
          {memberCount}/{maxMembers}
        </Badge>
      </div>

      {team.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {team.description}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold">{team.tournaments_won}</p>
          <p className="text-xs text-muted-foreground">Wins</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold">{team.total_tournaments}</p>
          <p className="text-xs text-muted-foreground">Tournaments</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold">₹{team.total_earnings.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Earnings</p>
        </div>
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isUserMember ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onLeave?.(team.id)}
            disabled={isLoading}
          >
            Leave Team
          </Button>
        ) : hasOpenSlots ? (
          <Button 
            className="w-full"
            onClick={() => onJoin?.(team.id)}
            disabled={isLoading}
          >
            Join Team
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" disabled>
            Team Full
          </Button>
        )}
      </div>
    </Card>
  );
};