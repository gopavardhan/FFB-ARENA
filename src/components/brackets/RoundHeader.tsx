import { Badge } from "@/components/ui/badge";

interface RoundHeaderProps {
  roundNumber: number;
  totalRounds: number;
  matchCount: number;
}

const getRoundName = (roundNumber: number, totalRounds: number) => {
  if (roundNumber === totalRounds) return "Finals";
  if (roundNumber === totalRounds - 1) return "Semi-Finals";
  if (roundNumber === totalRounds - 2) return "Quarter-Finals";
  return `Round ${roundNumber}`;
};

export const RoundHeader = ({ roundNumber, totalRounds, matchCount }: RoundHeaderProps) => {
  return (
    <div className="flex items-center justify-between pb-2 border-b">
      <h3 className="font-semibold text-lg">
        {getRoundName(roundNumber, totalRounds)}
      </h3>
      <Badge variant="secondary">
        {matchCount} {matchCount === 1 ? 'Match' : 'Matches'}
      </Badge>
    </div>
  );
};