// Types for new features: Statistics, Achievements, Brackets, Teams

// ============================================================================
// PLAYER STATISTICS TYPES
// ============================================================================

export interface PlayerStatistics {
  id: string;
  user_id: string;
  total_tournaments: number;
  tournaments_won: number;
  tournaments_top3: number;
  total_earnings: number;
  total_spent: number;
  win_rate: number;
  average_placement: number;
  best_placement: number;
  current_streak: number;
  longest_streak: number;
  favorite_game_mode: string | null;
  last_tournament_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
}

export interface PerformanceData {
  date: string;
  tournaments: number;
  wins: number;
  earnings: number;
}

// ============================================================================
// ACHIEVEMENT TYPES
// ============================================================================

export type AchievementCategory = 'tournament' | 'earnings' | 'social' | 'special';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type RequirementType = 'tournaments_won' | 'total_tournaments' | 'total_earnings' | 'win_streak';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement_type: RequirementType;
  requirement_value: number;
  points: number;
  rarity: AchievementRarity;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  unlocked_at: string | null;
  is_unlocked: boolean;
  created_at: string;
  achievements?: Achievement;
}

export interface AchievementWithProgress extends Achievement {
  progress: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

// ============================================================================
// TOURNAMENT BRACKET TYPES
// ============================================================================

export type MatchStatus = 'pending' | 'in_progress' | 'completed';

export interface TournamentBracket {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  player1_score: number;
  player2_score: number;
  status: MatchStatus;
  scheduled_time: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BracketMatch extends TournamentBracket {
  player1?: {
    id: string;
    full_name: string;
    username: string;
  };
  player2?: {
    id: string;
    full_name: string;
    username: string;
  };
  winner?: {
    id: string;
    full_name: string;
    username: string;
  };
}

export interface BracketRound {
  round_number: number;
  matches: BracketMatch[];
}

export interface BracketStructure {
  tournament_id: string;
  total_rounds: number;
  rounds: BracketRound[];
}

// ============================================================================
// TEAM TYPES
// ============================================================================

export type TeamRole = 'captain' | 'member';
export type TournamentType = 'solo' | 'duo' | 'squad';

export interface Team {
  id: string;
  name: string;
  tag: string | null;
  captain_id: string;
  description: string | null;
  is_active: boolean;
  total_tournaments: number;
  tournaments_won: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
}

export interface TeamWithMembers extends Team {
  members: Array<TeamMember & {
    profiles: {
      full_name: string;
      username: string;
    };
  }>;
  captain: {
    full_name: string;
    username: string;
  };
}

export interface TeamStatistics {
  team_id: string;
  total_tournaments: number;
  tournaments_won: number;
  win_rate: number;
  total_earnings: number;
  average_placement: number;
}

// ============================================================================
// ENHANCED TOURNAMENT TYPES
// ============================================================================

export interface TeamTournament {
  id: string;
  name: string;
  tournament_type: TournamentType;
  team_size: number;
  entry_fee: number;
  prize_pool: number;
  total_slots: number;
  filled_slots: number;
  status: string;
  start_date: string;
  game_mode: string;
  created_at: string;
}

export interface TeamRegistration {
  id: string;
  tournament_id: string;
  team_id: string;
  registered_at: string;
  slot_number: number;
  team?: TeamWithMembers;
}

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface StatsCardProps {
  stat: StatCard;
  loading?: boolean;
}

export interface AchievementCardProps {
  achievement: AchievementWithProgress;
  onClick?: () => void;
}

export interface BracketMatchProps {
  match: BracketMatch;
  onMatchClick?: (match: BracketMatch) => void;
}

export interface TeamCardProps {
  team: TeamWithMembers;
  onJoin?: (teamId: string) => void;
  onLeave?: (teamId: string) => void;
  isUserMember?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface StatsResponse {
  statistics: PlayerStatistics;
  recentPerformance: PerformanceData[];
  ranking: {
    overall: number;
    byWinRate: number;
    byEarnings: number;
  };
}

export interface AchievementsResponse {
  unlocked: AchievementWithProgress[];
  locked: AchievementWithProgress[];
  totalPoints: number;
  completionPercentage: number;
}

export interface BracketResponse {
  bracket: BracketStructure;
  tournament: {
    id: string;
    name: string;
    status: string;
  };
}

export interface TeamsResponse {
  teams: TeamWithMembers[];
  userTeams: TeamWithMembers[];
  totalTeams: number;
}

// ============================================================================
// FILTER AND SORT TYPES
// ============================================================================

export interface AchievementFilters {
  category?: AchievementCategory;
  rarity?: AchievementRarity;
  unlocked?: boolean;
}

export interface TeamFilters {
  searchQuery?: string;
  hasOpenSlots?: boolean;
  sortBy?: 'name' | 'tournaments_won' | 'total_earnings' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface StatsFilters {
  timeRange?: 'week' | 'month' | 'year' | 'all';
  gameMode?: string;
}
