-- ============================================
-- ACHIEVEMENT TRACKING SYSTEM
-- ============================================
-- This sets up automatic achievement progress tracking
-- when tournaments are won
-- ============================================

-- Function to update achievement progress
CREATE OR REPLACE FUNCTION update_achievement_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_prize_amount NUMERIC;
  v_total_wins INTEGER;
  v_total_earnings NUMERIC;
BEGIN
  -- Only process when a winner is declared (rank 1)
  IF NEW.rank = 1 THEN
    v_user_id := NEW.user_id;
    v_prize_amount := NEW.prize_amount;
    
    -- Get total wins for this user
    SELECT COUNT(*) INTO v_total_wins
    FROM tournament_results
    WHERE user_id = v_user_id AND rank = 1;
    
    -- Get total earnings for this user
    SELECT COALESCE(SUM(prize_amount), 0) INTO v_total_earnings
    FROM tournament_results
    WHERE user_id = v_user_id AND rank = 1;
    
    -- Update or create achievement progress records
    
    -- Achievement: First Victory (win 1 tournament)
    INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
    SELECT v_user_id, id, 1, NOW()
    FROM achievements
    WHERE title = 'First Victory'
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
      progress = 1,
      unlocked_at = CASE WHEN user_achievements.unlocked_at IS NULL THEN NOW() ELSE user_achievements.unlocked_at END;
    
    -- Achievement: Tournament Champion (win 5 tournaments)
    INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
    SELECT v_user_id, id, LEAST(v_total_wins, 5), 
           CASE WHEN v_total_wins >= 5 THEN NOW() ELSE NULL END
    FROM achievements
    WHERE title = 'Tournament Champion'
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
      progress = LEAST(v_total_wins, 5),
      unlocked_at = CASE WHEN v_total_wins >= 5 AND user_achievements.unlocked_at IS NULL THEN NOW() ELSE user_achievements.unlocked_at END;
    
    -- Achievement: Legendary Winner (win 10 tournaments)
    INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
    SELECT v_user_id, id, LEAST(v_total_wins, 10),
           CASE WHEN v_total_wins >= 10 THEN NOW() ELSE NULL END
    FROM achievements
    WHERE title = 'Legendary Winner'
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
      progress = LEAST(v_total_wins, 10),
      unlocked_at = CASE WHEN v_total_wins >= 10 AND user_achievements.unlocked_at IS NULL THEN NOW() ELSE user_achievements.unlocked_at END;
    
    -- Achievement: Money Maker (earn ₹1000)
    INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
    SELECT v_user_id, id, LEAST(v_total_earnings, 1000),
           CASE WHEN v_total_earnings >= 1000 THEN NOW() ELSE NULL END
    FROM achievements
    WHERE title = 'Money Maker'
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
      progress = LEAST(v_total_earnings, 1000),
      unlocked_at = CASE WHEN v_total_earnings >= 1000 AND user_achievements.unlocked_at IS NULL THEN NOW() ELSE user_achievements.unlocked_at END;
    
    -- Achievement: Big Earner (earn ₹5000)
    INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
    SELECT v_user_id, id, LEAST(v_total_earnings, 5000),
           CASE WHEN v_total_earnings >= 5000 THEN NOW() ELSE NULL END
    FROM achievements
    WHERE title = 'Big Earner'
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
      progress = LEAST(v_total_earnings, 5000),
      unlocked_at = CASE WHEN v_total_earnings >= 5000 AND user_achievements.unlocked_at IS NULL THEN NOW() ELSE user_achievements.unlocked_at END;
    
    -- Achievement: Millionaire (earn ₹10000)
    INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
    SELECT v_user_id, id, LEAST(v_total_earnings, 10000),
           CASE WHEN v_total_earnings >= 10000 THEN NOW() ELSE NULL END
    FROM achievements
    WHERE title = 'Millionaire'
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
      progress = LEAST(v_total_earnings, 10000),
      unlocked_at = CASE WHEN v_total_earnings >= 10000 AND user_achievements.unlocked_at IS NULL THEN NOW() ELSE user_achievements.unlocked_at END;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on tournament_results
DROP TRIGGER IF EXISTS trigger_update_achievements ON tournament_results;

CREATE TRIGGER trigger_update_achievements
AFTER INSERT ON tournament_results
FOR EACH ROW
EXECUTE FUNCTION update_achievement_progress();

-- Manually update achievements for existing tournament results
-- This will catch up any wins that happened before the trigger was created
DO $$
DECLARE
  result_record RECORD;
BEGIN
  FOR result_record IN 
    SELECT user_id, prize_amount 
    FROM tournament_results 
    WHERE rank = 1
    ORDER BY created_at
  LOOP
    -- Simulate the trigger for each existing result
    PERFORM update_achievement_progress_manual(result_record.user_id);
  END LOOP;
END $$;

-- Helper function to manually update achievements for a user
CREATE OR REPLACE FUNCTION update_achievement_progress_manual(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_wins INTEGER;
  v_total_earnings NUMERIC;
BEGIN
  -- Get total wins
  SELECT COUNT(*) INTO v_total_wins
  FROM tournament_results
  WHERE user_id = p_user_id AND rank = 1;
  
  -- Get total earnings
  SELECT COALESCE(SUM(prize_amount), 0) INTO v_total_earnings
  FROM tournament_results
  WHERE user_id = p_user_id AND rank = 1;
  
  -- Update all win-based achievements
  INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
  SELECT p_user_id, id, 
         CASE 
           WHEN title = 'First Victory' THEN LEAST(v_total_wins, 1)
           WHEN title = 'Tournament Champion' THEN LEAST(v_total_wins, 5)
           WHEN title = 'Legendary Winner' THEN LEAST(v_total_wins, 10)
           ELSE 0
         END,
         CASE 
           WHEN title = 'First Victory' AND v_total_wins >= 1 THEN NOW()
           WHEN title = 'Tournament Champion' AND v_total_wins >= 5 THEN NOW()
           WHEN title = 'Legendary Winner' AND v_total_wins >= 10 THEN NOW()
           ELSE NULL
         END
  FROM achievements
  WHERE title IN ('First Victory', 'Tournament Champion', 'Legendary Winner')
  ON CONFLICT (user_id, achievement_id) 
  DO UPDATE SET 
    progress = EXCLUDED.progress,
    unlocked_at = COALESCE(user_achievements.unlocked_at, EXCLUDED.unlocked_at);
  
  -- Update all earning-based achievements
  INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
  SELECT p_user_id, id,
         CASE 
           WHEN title = 'Money Maker' THEN LEAST(v_total_earnings, 1000)
           WHEN title = 'Big Earner' THEN LEAST(v_total_earnings, 5000)
           WHEN title = 'Millionaire' THEN LEAST(v_total_earnings, 10000)
           ELSE 0
         END,
         CASE 
           WHEN title = 'Money Maker' AND v_total_earnings >= 1000 THEN NOW()
           WHEN title = 'Big Earner' AND v_total_earnings >= 5000 THEN NOW()
           WHEN title = 'Millionaire' AND v_total_earnings >= 10000 THEN NOW()
           ELSE NULL
         END
  FROM achievements
  WHERE title IN ('Money Maker', 'Big Earner', 'Millionaire')
  ON CONFLICT (user_id, achievement_id) 
  DO UPDATE SET 
    progress = EXCLUDED.progress,
    unlocked_at = COALESCE(user_achievements.unlocked_at, EXCLUDED.unlocked_at);
END;
$$ LANGUAGE plpgsql;

-- Update achievements for all users who have won tournaments
SELECT update_achievement_progress_manual(user_id)
FROM (
  SELECT DISTINCT user_id 
  FROM tournament_results 
  WHERE rank = 1
) AS winners;

-- Verify the setup
SELECT '✅ Achievement tracking system installed!' as status;

SELECT 'Trigger created:' as info;
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_achievements';

SELECT 'Achievement progress updated for users:' as info;
SELECT COUNT(DISTINCT user_id) as users_with_achievements
FROM user_achievements;
