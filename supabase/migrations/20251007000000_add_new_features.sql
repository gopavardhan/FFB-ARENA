-- Migration: Add Player Statistics, Achievements, Brackets, and Team Tournaments
-- Created: 2025-10-07

-- ============================================================================
-- 1. PLAYER STATISTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_tournaments INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,
  tournaments_top3 INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  average_placement DECIMAL(5,2) DEFAULT 0,
  best_placement INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  favorite_game_mode VARCHAR(50),
  last_tournament_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_player_stats_user_id ON player_statistics(user_id);
CREATE INDEX idx_player_stats_win_rate ON player_statistics(win_rate DESC);
CREATE INDEX idx_player_stats_total_earnings ON player_statistics(total_earnings DESC);

-- RLS Policies for player_statistics
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all player statistics"
  ON player_statistics FOR SELECT
  USING (true);

CREATE POLICY "Users can update own statistics"
  ON player_statistics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert statistics"
  ON player_statistics FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50) NOT NULL, -- 'tournament', 'earnings', 'social', 'special'
  requirement_type VARCHAR(50) NOT NULL, -- 'tournaments_won', 'total_earnings', etc.
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for achievements
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- RLS Policies for achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active achievements"
  ON achievements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage achievements"
  ON achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'boss')
    )
  );

-- ============================================================================
-- 3. USER ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP,
  is_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Index for user achievements
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(is_unlocked);

-- RLS Policies for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' unlocked achievements"
  ON user_achievements FOR SELECT
  USING (is_unlocked = true);

CREATE POLICY "System can insert user achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update user achievements"
  ON user_achievements FOR UPDATE
  USING (true);

-- ============================================================================
-- 4. TOURNAMENT BRACKETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tournament_brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id UUID REFERENCES auth.users(id),
  player2_id UUID REFERENCES auth.users(id),
  winner_id UUID REFERENCES auth.users(id),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  scheduled_time TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for brackets
CREATE INDEX idx_brackets_tournament_id ON tournament_brackets(tournament_id);
CREATE INDEX idx_brackets_round ON tournament_brackets(round_number);
CREATE INDEX idx_brackets_status ON tournament_brackets(status);

-- RLS Policies for tournament_brackets
ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament brackets"
  ON tournament_brackets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage brackets"
  ON tournament_brackets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'boss')
    )
  );

-- ============================================================================
-- 5. TEAMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  tag VARCHAR(10),
  captain_id UUID REFERENCES auth.users(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  total_tournaments INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for teams
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_teams_active ON teams(is_active);

-- RLS Policies for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active teams"
  ON teams FOR SELECT
  USING (is_active = true);

CREATE POLICY "Team captains can update their teams"
  ON teams FOR UPDATE
  USING (auth.uid() = captain_id);

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = captain_id);

-- ============================================================================
-- 6. TEAM MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'captain', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Index for team members
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- RLS Policies for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Team captains can manage members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id AND teams.captain_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. UPDATE EXISTING TABLES
-- ============================================================================

-- Add team support to tournaments
ALTER TABLE tournaments 
  ADD COLUMN IF NOT EXISTS tournament_type VARCHAR(20) DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;

-- Add team support to tournament_registrations
ALTER TABLE tournament_registrations 
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- ============================================================================
-- 8. FUNCTIONS FOR STATISTICS CALCULATION
-- ============================================================================

-- Function to update player statistics after tournament completion
CREATE OR REPLACE FUNCTION update_player_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update statistics for the winner
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL THEN
    INSERT INTO player_statistics (user_id, total_tournaments, tournaments_won, total_earnings)
    VALUES (NEW.winner_id, 1, 1, NEW.prize_pool)
    ON CONFLICT (user_id) DO UPDATE SET
      total_tournaments = player_statistics.total_tournaments + 1,
      tournaments_won = player_statistics.tournaments_won + 1,
      total_earnings = player_statistics.total_earnings + NEW.prize_pool,
      win_rate = (player_statistics.tournaments_won + 1.0) / (player_statistics.total_tournaments + 1.0) * 100,
      current_streak = player_statistics.current_streak + 1,
      longest_streak = GREATEST(player_statistics.longest_streak, player_statistics.current_streak + 1),
      last_tournament_date = NOW(),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tournament completion
CREATE TRIGGER trigger_update_player_statistics
AFTER UPDATE ON tournaments
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION update_player_statistics();

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  achievement RECORD;
  user_stat RECORD;
BEGIN
  -- Get user statistics
  SELECT * INTO user_stat FROM player_statistics WHERE user_id = p_user_id;
  
  IF user_stat IS NULL THEN
    RETURN;
  END IF;
  
  -- Check each achievement
  FOR achievement IN SELECT * FROM achievements WHERE is_active = true LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_id = achievement.id AND is_unlocked = true
    ) THEN
      -- Check requirement
      CASE achievement.requirement_type
        WHEN 'tournaments_won' THEN
          IF user_stat.tournaments_won >= achievement.requirement_value THEN
            INSERT INTO user_achievements (user_id, achievement_id, progress, is_unlocked, unlocked_at)
            VALUES (p_user_id, achievement.id, achievement.requirement_value, true, NOW())
            ON CONFLICT (user_id, achievement_id) DO UPDATE SET
              is_unlocked = true,
              unlocked_at = NOW(),
              progress = achievement.requirement_value;
          END IF;
        WHEN 'total_tournaments' THEN
          IF user_stat.total_tournaments >= achievement.requirement_value THEN
            INSERT INTO user_achievements (user_id, achievement_id, progress, is_unlocked, unlocked_at)
            VALUES (p_user_id, achievement.id, achievement.requirement_value, true, NOW())
            ON CONFLICT (user_id, achievement_id) DO UPDATE SET
              is_unlocked = true,
              unlocked_at = NOW(),
              progress = achievement.requirement_value;
          END IF;
        WHEN 'total_earnings' THEN
          IF user_stat.total_earnings >= achievement.requirement_value THEN
            INSERT INTO user_achievements (user_id, achievement_id, progress, is_unlocked, unlocked_at)
            VALUES (p_user_id, achievement.id, achievement.requirement_value, true, NOW())
            ON CONFLICT (user_id, achievement_id) DO UPDATE SET
              is_unlocked = true,
              unlocked_at = NOW(),
              progress = achievement.requirement_value;
          END IF;
      END CASE;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate tournament bracket
CREATE OR REPLACE FUNCTION generate_tournament_bracket(p_tournament_id UUID)
RETURNS void AS $$
DECLARE
  player_count INTEGER;
  round_count INTEGER;
  current_round INTEGER := 1;
  match_num INTEGER := 1;
  player_ids UUID[];
  i INTEGER;
BEGIN
  -- Get registered players
  SELECT array_agg(user_id ORDER BY registered_at) INTO player_ids
  FROM tournament_registrations
  WHERE tournament_id = p_tournament_id;
  
  player_count := array_length(player_ids, 1);
  
  IF player_count IS NULL OR player_count < 2 THEN
    RAISE EXCEPTION 'Not enough players to generate bracket';
  END IF;
  
  -- Calculate number of rounds (log2 of player count, rounded up)
  round_count := CEIL(LOG(2, player_count));
  
  -- Generate first round matches
  FOR i IN 1..player_count BY 2 LOOP
    IF i + 1 <= player_count THEN
      INSERT INTO tournament_brackets (
        tournament_id, round_number, match_number,
        player1_id, player2_id, status
      ) VALUES (
        p_tournament_id, current_round, match_num,
        player_ids[i], player_ids[i+1], 'pending'
      );
    ELSE
      -- Bye (player advances automatically)
      INSERT INTO tournament_brackets (
        tournament_id, round_number, match_number,
        player1_id, winner_id, status
      ) VALUES (
        p_tournament_id, current_round, match_num,
        player_ids[i], player_ids[i], 'completed'
      );
    END IF;
    match_num := match_num + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. SEED INITIAL ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points, rarity) VALUES
  -- Tournament Achievements
  ('First Victory', 'Win your first tournament', '🏆', 'tournament', 'tournaments_won', 1, 10, 'common'),
  ('Champion', 'Win 5 tournaments', '👑', 'tournament', 'tournaments_won', 5, 50, 'rare'),
  ('Legend', 'Win 10 tournaments', '⭐', 'tournament', 'tournaments_won', 10, 100, 'epic'),
  ('God Mode', 'Win 25 tournaments', '💎', 'tournament', 'tournaments_won', 25, 250, 'legendary'),
  
  -- Participation Achievements
  ('Getting Started', 'Participate in your first tournament', '🎮', 'tournament', 'total_tournaments', 1, 5, 'common'),
  ('Regular Player', 'Participate in 10 tournaments', '🎯', 'tournament', 'total_tournaments', 10, 25, 'common'),
  ('Dedicated Gamer', 'Participate in 50 tournaments', '🔥', 'tournament', 'total_tournaments', 50, 100, 'rare'),
  ('Tournament Veteran', 'Participate in 100 tournaments', '⚡', 'tournament', 'total_tournaments', 100, 200, 'epic'),
  
  -- Earnings Achievements
  ('First Earnings', 'Earn your first ₹100', '💰', 'earnings', 'total_earnings', 100, 10, 'common'),
  ('Money Maker', 'Earn ₹1,000 total', '💵', 'earnings', 'total_earnings', 1000, 50, 'rare'),
  ('High Roller', 'Earn ₹5,000 total', '💸', 'earnings', 'total_earnings', 5000, 150, 'epic'),
  ('Millionaire Path', 'Earn ₹10,000 total', '🤑', 'earnings', 'total_earnings', 10000, 300, 'legendary'),
  
  -- Special Achievements
  ('Early Adopter', 'Join FFB ARENA in the first month', '🌟', 'special', 'total_tournaments', 1, 25, 'rare'),
  ('Perfect Week', 'Win 3 tournaments in a week', '🎊', 'special', 'tournaments_won', 3, 75, 'epic'),
  ('Unstoppable', 'Win 5 tournaments in a row', '🚀', 'special', 'tournaments_won', 5, 150, 'legendary')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================

COMMENT ON TABLE player_statistics IS 'Stores comprehensive player statistics and performance metrics';
COMMENT ON TABLE achievements IS 'Defines all available achievements in the system';
COMMENT ON TABLE user_achievements IS 'Tracks user progress and unlocked achievements';
COMMENT ON TABLE tournament_brackets IS 'Stores tournament bracket structure and match results';
COMMENT ON TABLE teams IS 'Stores team information for team-based tournaments';
COMMENT ON TABLE team_members IS 'Tracks team membership and roles';
