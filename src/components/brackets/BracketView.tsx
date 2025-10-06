import { Card } from "@/components/ui/card";
import { BracketMatch } from "@/types/features";
import { MatchCard } from "./MatchCard";
import { RoundHeader } from "./RoundHeader";

interface BracketViewProps {
  tournamentId: string;
  rounds: Array<{
    round_number: number;
    matches: BracketMatch[];
  }>;
}

export const BracketView = ({ tournamentId, rounds }: BracketViewProps) => {
  if (!rounds || rounds.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No bracket data available</p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-8 p-6 min-w-full">
        {rounds.map((round) => (
          <div key={round.round_number} className="flex flex-col gap-4 min-w-[300px]">
            <RoundHeader 
              roundNumber={round.round_number} 
              totalRounds={rounds.length}
              matchCount={round.matches.length}
            />
            <div className="space-y-4">
              {round.matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};