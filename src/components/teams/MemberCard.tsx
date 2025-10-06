import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, UserMinus } from "lucide-react";
import { TeamMember } from "@/types/features";

interface MemberCardProps {
  member: TeamMember & { profiles: { full_name: string; username: string } };
  isUserCaptain: boolean;
  isCaptain: boolean;
  onRemove?: (memberId: string) => void;
}

export const MemberCard = ({ member, isUserCaptain, isCaptain, onRemove }: MemberCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center font-bold">
            {member.profiles.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{member.profiles.username}</p>
              {isCaptain && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {member.profiles.full_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isCaptain ? "default" : "secondary"}>
            {member.role}
          </Badge>
          {isUserCaptain && !isCaptain && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(member.id)}
            >
              <UserMinus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};