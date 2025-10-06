import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Team, TeamMember, TeamWithMembers, TeamFilters } from "@/types/features";
import { toast } from "@/hooks/use-toast";

// Fetch all teams
export const useTeams = (filters?: TeamFilters) => {
  return useQuery({
    queryKey: ["teams", filters],
    queryFn: async () => {
      let query = supabase
        .from("teams" as any)
        .select(`
          *,
          captain:captain_id (
            profiles (
              full_name,
              username
            )
          ),
          members:team_members (
            id,
            user_id,
            role,
            joined_at,
            profiles:user_id (
              full_name,
              username
            )
          )
        `)
        .eq("is_active", true);

      if (filters?.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,tag.ilike.%${filters.searchQuery}%`);
      }

      const sortBy = filters?.sortBy || "created_at";
      const sortOrder = filters?.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data, error } = await query;

      if (error) throw error;

      // Filter teams with open slots if requested
      let teams = data as TeamWithMembers[];
      
      if (filters?.hasOpenSlots) {
        teams = teams.filter((team: any) => team.members.length < 4);
      }

      return teams;
    },
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });
};

// Fetch single team
export const useTeam = (teamId: string | undefined) => {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      if (!teamId) throw new Error("Team ID is required");

      const { data, error } = await supabase
        .from("teams" as any)
        .select(`
          *,
          captain:captain_id (
            profiles (
              full_name,
              username
            )
          ),
          members:team_members (
            id,
            user_id,
            role,
            joined_at,
            profiles:user_id (
              full_name,
              username
            )
          )
        `)
        .eq("id", teamId)
        .single();

      if (error) throw error;
      return data as TeamWithMembers;
    },
    enabled: !!teamId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Fetch user's teams
export const useUserTeams = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-teams", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("team_members" as any)
        .select(`
          *,
          team:team_id (
            id,
            name,
            tag,
            captain_id,
            description,
            is_active,
            total_tournaments,
            tournaments_won,
            total_earnings,
            created_at,
            captain:captain_id (
              profiles (
                full_name,
                username
              )
            ),
            members:team_members (
              id,
              user_id,
              role,
              joined_at,
              profiles:user_id (
                full_name,
                username
              )
            )
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;

      return data.map((tm: any) => tm.team) as TeamWithMembers[];
    },
    enabled: !!userId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Create team
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      tag,
      description,
      captainId,
    }: {
      name: string;
      tag?: string;
      description?: string;
      captainId: string;
    }) => {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from("teams" as any)
        .insert({
          name,
          tag,
          description,
          captain_id: captainId,
          is_active: true,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add captain as member
      const { error: memberError } = await supabase
        .from("team_members" as any)
        .insert({
          team_id: team.id,
          user_id: captainId,
          role: "captain",
        });

      if (memberError) throw memberError;

      return team;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams", variables.captainId] });
      toast({
        title: "Team Created",
        description: "Your team has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Update team
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      updates,
    }: {
      teamId: string;
      updates: Partial<Team>;
    }) => {
      const { data, error } = await supabase
        .from("teams" as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", teamId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team", data.id] });
      toast({
        title: "Team Updated",
        description: "Team information has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Delete team
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from("teams" as any)
        .update({ is_active: false })
        .eq("id", teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      toast({
        title: "Team Deleted",
        description: "Team has been deactivated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Join team
export const useJoinTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }) => {
      // Check if team is full (max 4 members)
      const { data: members, error: checkError } = await supabase
        .from("team_members" as any)
        .select("id")
        .eq("team_id", teamId);

      if (checkError) throw checkError;

      if (members && members.length >= 4) {
        throw new Error("Team is full (maximum 4 members)");
      }

      // Add member
      const { data, error } = await supabase
        .from("team_members" as any)
        .insert({
          team_id: teamId,
          user_id: userId,
          role: "member",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["user-teams", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Joined Team",
        description: "You have successfully joined the team",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Leave team
export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }) => {
      // Check if user is captain
      const { data: team, error: teamError } = await supabase
        .from("teams" as any)
        .select("captain_id")
        .eq("id", teamId)
        .single();

      if (teamError) throw teamError;

      if (team.captain_id === userId) {
        throw new Error("Captain cannot leave team. Transfer captaincy or delete team.");
      }

      const { error } = await supabase
        .from("team_members" as any)
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["user-teams", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Left Team",
        description: "You have left the team",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Remove team member (captain only)
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("team_members" as any)
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Member Removed",
        description: "Team member has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Transfer captaincy
export const useTransferCaptaincy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      newCaptainId,
      oldCaptainId,
    }: {
      teamId: string;
      newCaptainId: string;
      oldCaptainId: string;
    }) => {
      // Update team captain
      const { error: teamError } = await supabase
        .from("teams" as any)
        .update({ captain_id: newCaptainId })
        .eq("id", teamId);

      if (teamError) throw teamError;

      // Update old captain role to member
      const { error: oldError } = await supabase
        .from("team_members" as any)
        .update({ role: "member" })
        .eq("team_id", teamId)
        .eq("user_id", oldCaptainId);

      if (oldError) throw oldError;

      // Update new captain role
      const { error: newError } = await supabase
        .from("team_members" as any)
        .update({ role: "captain" })
        .eq("team_id", teamId)
        .eq("user_id", newCaptainId);

      if (newError) throw newError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Captaincy Transferred",
        description: "Team captain has been changed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Check if user is team member
export const useIsTeamMember = (teamId: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ["is-team-member", teamId, userId],
    queryFn: async () => {
      if (!teamId || !userId) return false;

      const { data, error } = await supabase
        .from("team_members" as any)
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!teamId && !!userId,
    refetchInterval: false,
    staleTime: 30000,
  });
};

// Get team statistics
export const useTeamStatistics = (teamId: string | undefined) => {
  return useQuery({
    queryKey: ["team-statistics", teamId],
    queryFn: async () => {
      if (!teamId) throw new Error("Team ID is required");

      const { data, error } = await supabase
        .from("teams" as any)
        .select("total_tournaments, tournaments_won, total_earnings")
        .eq("id", teamId)
        .single();

      if (error) throw error;

      const winRate = data.total_tournaments > 0
        ? (data.tournaments_won / data.total_tournaments) * 100
        : 0;

      return {
        ...data,
        win_rate: winRate,
      };
    },
    enabled: !!teamId,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
