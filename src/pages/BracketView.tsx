import { useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { BracketView as BracketViewComponent } from "@/components/brackets/BracketView";
import { BracketLegend } from "@/components/brackets/BracketLegend";
import { MatchDetails } from "@/components/brackets/MatchDetails";
import { useTournamentBracket } from "@/hooks/useBrackets";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { BracketMatch } from "@/types/features";
import { Card } from "@/components/ui/card";

const BracketView = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const { data: bracket, isLoading } = useTournamentBracket(id!);

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (!bracket) {
    return (
      <MainLayout>
        <PageHeader title="Tournament Bracket" />
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Bracket not available</p>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Tournament Bracket"
        subtitle={`${bracket.rounds.length} rounds • Single Elimination`}
      />

      <div className="space-y-6">
        <BracketLegend />
        
        <Card className="p-6">
          <BracketViewComponent 
            tournamentId={id!}
            rounds={bracket.rounds}
          />
        </Card>
      </div>

      <MatchDetails
        match={selectedMatch}
        open={!!selectedMatch}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
      />
    </MainLayout>
  );
};

export default BracketView;