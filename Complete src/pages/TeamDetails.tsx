import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamDetails as TeamDetailsComponent } from "@/components/teams/TeamDetails";
import { TeamSettings } from "@/components/teams/TeamSettings";
import { useTeam, useLeaveTeam } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: team, isLoading } = useTeam(id!);
  const leaveTeam = useLeaveTeam();

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Team not found</p>
          <Button onClick={() => navigate("/teams")} className="mt-4">
            Back to Teams
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isUserCaptain = team.captain_id === user?.id;
  const isUserMember = team.members?.some(m => m.user_id === user?.id) || false;

  const handleLeave = () => {
    const membership = team.members?.find(m => m.user_id === user?.id);
    if (membership) {
      leaveTeam.mutate(membership.id, {
        onSuccess: () => navigate("/teams"),
      });
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/teams")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>
      </div>

      <TeamDetailsComponent
        team={team}
        isUserCaptain={isUserCaptain}
        isUserMember={isUserMember}
        onLeave={handleLeave}
        onSettings={() => setSettingsOpen(true)}
      />

      {isUserCaptain && (
        <TeamSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          team={team}
        />
      )}
    </MainLayout>
  );
};

export default TeamDetails;