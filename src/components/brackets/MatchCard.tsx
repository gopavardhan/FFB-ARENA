import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BracketMatch } from "@/types/features";
import { Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: BracketMatch;
  onMatchClick?: (match: BracketMatch) => void;
}

export const MatchCard = ({ match, onMatchClick }: MatchCardProps) => {
  const isCompleted = match.status === 'completed';
  const isPending = match.status === 'pending';

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md",
        isCompleted && "border-green-500/20"
      )}
      onClick={() => onMatchClick?.(match)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">
            Match #{match.match_number}
          </span>
          <Badge variant={
            isCompleted ? "default" : 
            isPending ? "secondary" : 
            "outline"
          }>
            {match.status}
          </Badge>
        </div>

        {/* Player 1 */}
        <div className={cn(
          "flex items-center justify-between p-2 rounded",
          match.winner_id === match.player1_id && "bg-green-500/10"
        )}>
          <div className="flex items-center gap-2">
            {match.winner_id === match.player1_id && (
              <Trophy className="w-4 h-4 text-yellow-500" />
            )}
            <span className="font-semibold">
              {match.player1?.username || 'TBD'}
            </span>
          </div>
          {isCompleted && (
            <span className="font-bold">{match.player1_score}</span>
          )}
        </div>

        {/* VS Divider */}
        <div className="text-center text-xs text-muted-foreground">VS</div>

        {/* Player 2 */}
        <div className={cn(
          "flex items-center justify-between p-2 rounded",
          match.winner_id === match.player2_id && "bg-green-500/10"
        )}>
          <div className="flex items-center gap-2">
            {match.winner_id === match.player2_id && (
              <Trophy className="w-4 h-4 text-yellow-500" />
            )}
            <span className="font-semibold">
              {match.player2?.username || 'TBD'}
            </span>
          </div>
          {isCompleted && (
            <span className="font-bold">{match.player2_score}</span>
          )}
        </div>

        {match.scheduled_time && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Clock className="w-3 h-3" />
            <span>{new Date(match.scheduled_time).toLocaleString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
};