# 🔍 Backend Verification Guide

## How to Verify Backend is Working

This guide will help you verify that all backend components (database tables, functions, and data) are working correctly with the new UI.

---

## 🎯 Quick Verification Checklist

### ✅ Step 1: Check Database Tables Exist

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `xukowavzxgnjukalxjjv`

2. **Navigate to Table Editor**
   - Click "Table Editor" in left sidebar
   - Verify these 6 new tables exist:
     - ✅ `player_statistics`
     - ✅ `achievements`
     - ✅ `user_achievements`
     - ✅ `tournament_brackets`
     - ✅ `teams`
     - ✅ `team_members`

3. **Check Table Structure**
   - Click on each table
   - Verify columns match the migration

---

### ✅ Step 2: Check Default Achievements

1. **Open `achievements` table**
2. **Verify 15 default achievements exist:**
   - First Victory (common)
   - Tournament Veteran (common)
   - Top 3 Finish (rare)
   - Champion (rare)
   - Hat Trick (epic)
   - Dominator (epic)
   - Money Maker (rare)
   - High Roller (epic)
   - Millionaire (legendary)
   - Win Streak (rare)
   - Unstoppable (epic)
   - Social Butterfly (common)
   - Team Player (rare)
   - Early Bird (special)
   - Comeback King (special)

3. **Check achievement data:**
   - All have `is_active = true`
   - Points are assigned correctly
   - Categories are set (tournament, earnings, social, special)
   - Rarities are set (common, rare, epic, legendary)

---

### ✅ Step 3: Test Statistics Feature

#### A. Check if Statistics Page Loads
1. Navigate to: http://localhost:8080/statistics
2. **Expected Behavior:**
   - Page loads without errors
   - Shows "No statistics available yet" (if no data)
   - OR shows your stats if you've played tournaments

#### B. Verify Statistics Data
1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Refresh the page**
4. **Look for these API calls:**
   - `player_statistics` query
   - `recent_performance` query (if implemented)
   - `leaderboard` query

5. **Check Response:**
   - Status: 200 OK
   - Data structure matches TypeScript types
   - No errors in console

#### C. Test with Supabase SQL Editor
```sql
-- Check if player_statistics table has data
SELECT * FROM player_statistics LIMIT 10;

-- Check if your user has statistics
SELECT * FROM player_statistics 
WHERE user_id = 'YOUR_USER_ID';

-- If no data, create test data:
INSERT INTO player_statistics (
  user_id,
  total_tournaments,
  tournaments_won,
  tournaments_top3,
  total_earnings,
  total_spent,
  win_rate,
  average_placement,
  best_placement,
  current_streak,
  longest_streak
) VALUES (
  'YOUR_USER_ID',
  10,
  3,
  5,
  5000.00,
  2000.00,
  30.00,
  5.5,
  1,
  2,
  3
);
```

---

### ✅ Step 4: Test Achievements Feature

#### A. Check if Achievements Page Loads
1. Navigate to: http://localhost:8080/achievements
2. **Expected Behavior:**
   - Page loads without errors
   - Shows all 15 achievements
   - Locked achievements show lock icon
   - Filters work (category, rarity, status)

#### B. Verify Achievements Data
1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Refresh the page**
4. **Look for these API calls:**
   - `achievements` query (gets all achievements)
   - `user_achievements` query (gets user's progress)

5. **Check Response:**
   - All 15 achievements returned
   - User progress data (if any)
   - No errors in console

#### C. Test Achievement Unlock
```sql
-- Check user achievements
SELECT * FROM user_achievements 
WHERE user_id = 'YOUR_USER_ID';

-- Manually unlock an achievement for testing:
INSERT INTO user_achievements (
  user_id,
  achievement_id,
  progress,
  is_unlocked,
  unlocked_at
) VALUES (
  'YOUR_USER_ID',
  (SELECT id FROM achievements WHERE name = 'First Victory'),
  1,
  true,
  NOW()
);

-- Check if it appears as unlocked in UI
```

---

### ✅ Step 5: Test Teams Feature

#### A. Check if Teams Page Loads
1. Navigate to: http://localhost:8080/teams
2. **Expected Behavior:**
   - Page loads without errors
   - Shows "No teams found" (if no teams exist)
   - "Create Team" button visible
   - Search and filters work

#### B. Test Team Creation
1. **Click "Create Team" button**
2. **Fill in the form:**
   - Team Name: "Test Team"
   - Team Tag: "TEST"
   - Description: "This is a test team"
3. **Click "Create Team"**
4. **Expected Behavior:**
   - Success toast notification
   - Team appears in "My Teams" tab
   - You are the captain

#### C. Verify in Database
```sql
-- Check if team was created
SELECT * FROM teams 
WHERE captain_id = 'YOUR_USER_ID';

-- Check if you're a member
SELECT * FROM team_members 
WHERE user_id = 'YOUR_USER_ID';

-- Check team stats
SELECT 
  t.*,
  COUNT(tm.id) as member_count
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.captain_id = 'YOUR_USER_ID'
GROUP BY t.id;
```

#### D. Test Team Join/Leave
1. **Create a second user account** (or use existing)
2. **Browse teams**
3. **Click "Join Team" on a team**
4. **Expected Behavior:**
   - Success notification
   - Team appears in "My Teams"
   - Member count increases

---

### ✅ Step 6: Test Brackets Feature

#### A. Check if Bracket Page Loads
1. **First, you need a tournament with a bracket**
2. Navigate to: http://localhost:8080/tournaments/:id/bracket
   (Replace :id with actual tournament ID)
3. **Expected Behavior:**
   - Page loads without errors
   - Shows "Bracket not available" (if no bracket)
   - OR shows bracket tree if bracket exists

#### B. Create Test Bracket Data
```sql
-- Check if tournament exists
SELECT id, name, status FROM tournaments LIMIT 5;

-- Create test bracket for a tournament
INSERT INTO tournament_brackets (
  tournament_id,
  round_number,
  match_number,
  player1_id,
  player2_id,
  winner_id,
  player1_score,
  player2_score,
  status
) VALUES 
-- Round 1, Match 1
(
  'TOURNAMENT_ID',
  1,
  1,
  'PLAYER1_ID',
  'PLAYER2_ID',
  'PLAYER1_ID',
  10,
  5,
  'completed'
),
-- Round 1, Match 2
(
  'TOURNAMENT_ID',
  1,
  2,
  'PLAYER3_ID',
  'PLAYER4_ID',
  NULL,
  0,
  0,
  'pending'
);

-- Verify bracket was created
SELECT * FROM tournament_brackets 
WHERE tournament_id = 'TOURNAMENT_ID'
ORDER BY round_number, match_number;
```

---

### ✅ Step 7: Test Database Functions

#### A. Test Update Statistics Function
```sql
-- This function should be called automatically after tournaments
-- Test it manually:
SELECT update_player_statistics('YOUR_USER_ID');

-- Check if statistics were updated
SELECT * FROM player_statistics 
WHERE user_id = 'YOUR_USER_ID';
```

#### B. Test Check Achievements Function
```sql
-- This function checks if user unlocked any achievements
SELECT check_and_unlock_achievements('YOUR_USER_ID');

-- Check if any achievements were unlocked
SELECT 
  ua.*,
  a.name,
  a.description
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
WHERE ua.user_id = 'YOUR_USER_ID'
AND ua.is_unlocked = true;
```

#### C. Test Create Withdrawal Function
```sql
-- This function creates withdrawal and deducts balance
-- Test with small amount:
SELECT create_withdrawal_request(
  'YOUR_USER_ID',
  50.00,
  'test@upi'
);

-- Check if withdrawal was created
SELECT * FROM withdrawals 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- Check if balance was deducted
SELECT * FROM user_balances 
WHERE user_id = 'YOUR_USER_ID';
```

---

## 🔍 Advanced Verification

### Check Real-time Subscriptions

1. **Open Browser DevTools**
2. **Go to Console tab**
3. **Look for these messages:**
   ```
   Setting up realtime subscription for user balance
   Setting up realtime subscription for deposits/withdrawals
   Setting up realtime subscription for tournaments
   ```

4. **Test Real-time Updates:**
   - Open two browser windows
   - Make a change in one (e.g., create a team)
   - Verify it appears in the other window automatically

---

### Check API Performance

1. **Open Browser DevTools**
2. **Go to Network tab**
3. **Filter by "Fetch/XHR"**
4. **Check:**
   - All requests return 200 OK
   - Response times < 1 second
   - No 401 (unauthorized) errors
   - No 500 (server) errors

---

### Check Database Indexes

```sql
-- Verify indexes exist for performance
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN (
  'player_statistics',
  'achievements',
  'user_achievements',
  'tournament_brackets',
  'teams',
  'team_members'
);
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "No data available"
**Cause:** Tables are empty
**Solution:** Create test data using SQL queries above

### Issue 2: "Permission denied"
**Cause:** RLS policies not set correctly
**Solution:** Check Supabase RLS policies for new tables

### Issue 3: "Function not found"
**Cause:** Database functions not deployed
**Solution:** Re-run migration or create functions manually

### Issue 4: "Real-time not working"
**Cause:** Supabase real-time not enabled
**Solution:** Enable real-time in Supabase dashboard for new tables

---

## ✅ Verification Checklist

Use this checklist to verify everything:

### Database
- [ ] All 6 tables exist
- [ ] Tables have correct columns
- [ ] 15 achievements seeded
- [ ] RLS policies configured
- [ ] Indexes created

### Functions
- [ ] `update_player_statistics` exists
- [ ] `check_and_unlock_achievements` exists
- [ ] `create_withdrawal_request` exists
- [ ] All functions execute without errors

### UI Integration
- [ ] Statistics page loads
- [ ] Achievements page loads
- [ ] Teams page loads
- [ ] Bracket page loads
- [ ] Navigation menu works

### Data Flow
- [ ] Statistics data displays
- [ ] Achievements data displays
- [ ] Teams data displays
- [ ] Bracket data displays
- [ ] Real-time updates work

### CRUD Operations
- [ ] Can create team
- [ ] Can join team
- [ ] Can leave team
- [ ] Can view statistics
- [ ] Can see achievements

---

## 📊 Expected Results

### Statistics Page
- Shows player stats (or "no data" message)
- Performance chart renders
- Leaderboard displays
- Filters work

### Achievements Page
- Shows all 15 achievements
- Locked achievements have lock icon
- Unlocked achievements show trophy
- Progress bars display correctly
- Filters work

### Teams Page
- Shows all teams (or "no teams" message)
- Can create team
- Can join/leave teams
- Team details page works
- Captain can manage team

### Brackets Page
- Shows bracket tree (or "not available" message)
- Match cards display correctly
- Round labels show
- Winner highlighting works

---

## 🎯 Success Criteria

Backend is working correctly if:
1. ✅ All tables exist and have correct structure
2. ✅ All functions execute without errors
3. ✅ UI can fetch data from database
4. ✅ UI can create/update data in database
5. ✅ Real-time updates work
6. ✅ No console errors
7. ✅ All CRUD operations work
8. ✅ Data persists after page refresh

---

## 📞 Need Help?

If backend is not working:
1. Check Supabase dashboard for errors
2. Check browser console for API errors
3. Check Network tab for failed requests
4. Run SQL queries to verify data
5. Check RLS policies
6. Verify migration was deployed

---

**Once all checks pass, your backend is fully functional! 🎉**
