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