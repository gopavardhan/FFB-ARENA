# Complete UI Implementation Code - Part 2

Teams and Brackets components + Routes and Navigation updates.

---

## TEAM COMPONENTS (All 8 + 2 Pages)

### src/components/teams/TeamCard.tsx
```typescript
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
```

### src/components/teams/TeamList.tsx
```typescript
import { TeamCard } from "./TeamCard";
import { TeamWithMembers } from "@/types/features";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

interface TeamListProps {
  teams: TeamWithMembers[];
  userTeamIds: string[];
  onJoin: (teamId: string) => void;
  onLeave: (teamId: string) => void;
  isLoading?: boolean;
}

export const TeamList = ({ teams, userTeamIds, onJoin, onLeave, isLoading }: TeamListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'tournaments_won' | 'total_earnings'>('name');

  const filteredTeams = teams
    .filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.tag?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'tournaments_won') return b.tournaments_won - a.tournaments_won;
      if (sortBy === 'total_earnings') return b.total_earnings - a.total_earnings;
      return 0;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="tournaments_won">Most Wins</SelectItem>
            <SelectItem value="total_earnings">Highest Earnings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No teams found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isUserMember={userTeamIds.includes(team.id)}
              onJoin={onJoin}
              onLeave={onLeave}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

### src/components/teams/CreateTeamDialog.tsx
```typescript
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTeam } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTeamDialog = ({ open, onOpenChange }: CreateTeamDialogProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const createTeam = useCreateTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createTeam.mutate({
      name,
      tag: tag || null,
      captain_id: user.id,
      description: description || null,
    }, {
      onSuccess: () => {
        setName("");
        setTag("");
        setDescription("");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a team to compete in duo and squad tournaments
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Team Tag (Optional)</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              placeholder="e.g., PRO"
              maxLength={5}
            />
            <p className="text-xs text-muted-foreground">
              Max 5 characters, will be displayed as [TAG]
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about your team..."
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createTeam.isPending || !name} className="flex-1">
              {createTeam.isPending ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

### src/components/teams/TeamDetails.tsx
```typescript
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
```

### src/components/teams/MemberCard.tsx
```typescript
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
```

### src/components/teams/TeamStats.tsx
```typescript
import { Card } from "@/components/ui/card";
import { useTeamStatistics } from "@/hooks/useTeams";
import { LoadingSpinner } from "@/components/core/LoadingSpinner";
import { Trophy, Target, TrendingUp, Award } from "lucide-react";

interface TeamStatsProps {
  teamId: string;
}

export const TeamStats = ({ teamId }: TeamStatsProps) => {
  const { data: stats, isLoading } = useTeamStatistics(teamId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const winRate = stats.win_rate.toFixed(1);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Team Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg bg-secondary/5">
          <Trophy className="w-5 h-5 mx-auto mb-2 text-secondary" />
          <p className="text-xl font-bold">{stats.tournaments_won}</p>
          <p className="text-xs text-muted-foreground">Tournaments Won</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-accent/5">
          <Target className="w-5 h-5 mx-auto mb-2 text-accent" />
          <p className="text-xl font-bold">{winRate}%</p>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-primary/5">
          <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-xl font-bold">₹{stats.total_earnings.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Earnings</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-yellow-500/5">
          <Award className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
          <p className="text-xl font-bold">{stats.average_placement.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Avg Placement</p>
        </div>
      </div>
    </Card>
  );
};
```

### src/components/teams/InviteDialog.tsx
```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

export const InviteDialog = ({ open, onOpenChange, teamId }: InviteDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Players</DialogTitle>
          <DialogDescription>
            Search for players to invite to your team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="text-center py-8 text-muted-foreground">
            Player search feature coming soon
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### src/components/teams/TeamSettings.tsx
```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { TeamWithMembers } from "@/types/features";
import { useUpdateTeam, useDeleteTeam } from "@/hooks/useTeams";

interface TeamSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamWithMembers;
}

export const TeamSettings = ({ open, onOpenChange, team }: TeamSettingsProps) => {
  const [name, setName] = useState(team.name);
  const [tag, setTag] = useState(team.tag || "");
  const [description, setDescription] = useState(team.description || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const handleUpdate = () => {
    updateTeam.mutate({
      teamId: team.id,
      updates: {
        name,
        tag: tag || null,
        description: description || null,
      },
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const handleDelete = () => {
    deleteTeam.mutate(team.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        onOpenChange(false);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Settings</DialogTitle>
            <DialogDescription>
              Manage your team settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tag">Team Tag</Label>
              <Input
                id="edit-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleUpdate} 
                disabled={updateTeam.isPending}
                className="flex-1"
              >
                {updateTeam.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
              >
                Delete Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All team data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteTeam.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
```

### src/pages/Teams.tsx
```typescript
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
```

### src/pages/TeamDetails.tsx
```typescript
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
          <p className="text-muted-fore
