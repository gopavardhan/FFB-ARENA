import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeamList } from "@/components/teams/TeamList";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { useTeams, useUserTeams, useJoinTeam, useLeaveTeam } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Teams = () => {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { data: allTeams, isLoading: teamsLoading } = useTeams();
  const { data: userTeams, isLoading: userTeamsLoading } = useUserTeams(user?.id);
  const joinTeam = useJoinTeam();
  const leaveTeam = useLeaveTeam();

  const userTeamIds = userTeams?.map(t => t.id) || [];

  const handleJoin = (teamId: string) => {
    if (!user) return;
    joinTeam.mutate({ teamId, userId: user.id });
  };

  const handleLeave = (teamId: string) => {
    if (!user) return;
    const membership = userTeams?.find(t => t.id === teamId)?.members?.find(m => m.user_id === user.id);
    if (membership) {
      leaveTeam.mutate(membership.id);
    }
  };

  if (teamsLoading || userTeamsLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Teams" 
        subtitle="Join or create a team for duo and squad tournaments"
      />

      <div className="mb-6">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Teams</TabsTrigger>
          <TabsTrigger value="my-teams">My Teams ({userTeams?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TeamList
            teams={allTeams || []}
            userTeamIds={userTeamIds}
            onJoin={handleJoin}
            onLeave={handleLeave}
            isLoading={joinTeam.isPending || leaveTeam.isPending}
          />
        </TabsContent>

        <TabsContent value="my-teams">
          {userTeams && userTeams.length > 0 ? (
            <TeamList
              teams={userTeams}
              userTeamIds={userTeamIds}
              onJoin={handleJoin}
              onLeave={handleLeave}
              isLoading={joinTeam.isPending || leaveTeam.isPending}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              You haven't joined any teams yet
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateTeamDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </MainLayout>
  );
};

export default Teams;