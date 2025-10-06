import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BracketMatch } from "@/types/features";
import { Trophy, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface MatchDetailsProps {
  match: BracketMatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MatchDetails = ({ match, open, onOpenChange }: MatchDetailsProps) => {
  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Match #{match.match_number} Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge>{match.status}</Badge>
          </div>

          {match.scheduled_time && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scheduled</span>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                {format(new Date(match.scheduled_time), 'PPp')}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Players</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/5">
                <div className="flex items-center gap-2">
                  {match.winner_id === match.player1_id && (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="font-semibold">
                    {match.player1?.username || 'TBD'}
                  </span>
                </div>
                {match.status === 'completed' && (
                  <span className="text-lg font-bold">{match.player1_score}</span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/5">
                <div className="flex items-center gap-2">
                  {match.winner_id === match.player2_id && (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="font-semibold">
                    {match.player2?.username || 'TBD'}
                  </span>
                </div>
                {match.status === 'completed' && (
                  <span className="text-lg font-bold">{match.player2_score}</span>
                )}
              </div>
            </div>
          </div>

          {match.completed_at && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Completed</span>
              <span>{format(new Date(match.completed_at), 'PPp')}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};