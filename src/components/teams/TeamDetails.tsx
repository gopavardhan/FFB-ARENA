import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, TrendingUp, Crown, Settings } from "lucide-react";
import { TeamWithMembers } from "@/types/features";
import { MemberCard } from "./MemberCard";
import { TeamStats } from "./TeamStats";

interface TeamDetailsProps {
  team: TeamWithMembers;
  isUserCaptain: boolean;
  isUserMember: boolean;
  onLeave: () => void;
  onSettings: () => void;
}

export const TeamDetails = ({ team, isUserCaptain, isUserMember, onLeave, onSettings }: TeamDetailsProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-orbitron font-bold">{team.name}</h2>
              {team.tag && (
                <Badge variant="secondary" className="text-lg">[{team.tag}]</Badge>
              )}
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Captain: {team.captain?.username}
            </p>
          </div>
          {isUserCaptain && (
            <Button variant="outline" size="sm" onClick={onSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          )}
        </div>

        {team.description && (
          <p className="text-muted-foreground mb-4">{team.description}</p>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-secondary/5">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold">{team.tournaments_won}</p>
            <p className="text-sm text-muted-foreground">Wins</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/5">
            <Users className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{team.total_tournaments}</p>
            <p className="text-sm text-muted-foreground">Tournaments</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-primary/5">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">₹{team.total_earnings.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Earnings</p>
          </div>
        </div>

        {isUserMember && !isUserCaptain && (
          <Button variant="outline" className="w-full mt-4" onClick={onLeave}>
            Leave Team
          </Button>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Team Members ({team.members?.length || 0}/4)
        </h3>
        <div className="space-y-3">
          {team.members?.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isUserCaptain={isUserCaptain}
              isCaptain={member.user_id === team.captain_id}
            />
          ))}
        </div>
      </Card>

      <TeamStats teamId={team.id} />
    </div>
  );
};