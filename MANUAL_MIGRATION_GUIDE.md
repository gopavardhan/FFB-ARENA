# 🚀 Manual Migration Deployment Guide

## Why Manual Deployment?

The Supabase CLI requires authentication with an access token. Since we don't have that set up, the easiest way is to deploy the migration manually via the Supabase Dashboard.

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Log in to your account
3. Select your project: **xukowavzxgnjukalxjjv**

### Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** button (top right)

### Step 3: Copy Migration SQL

1. Open the file: `supabase/migrations/20251007000000_add_new_features.sql`
2. Select ALL content (Ctrl+A)
3. Copy it (Ctrl+C)

**Or use this command to view the file:**
```bash
cat supabase/migrations/20251007000000_add_new_features.sql
```

### Step 4: Paste and Execute

1. Paste the SQL into the SQL Editor (Ctrl+V)
2. Click **"Run"** button (or press Ctrl+Enter)
3. Wait for execution to complete (should take 5-10 seconds)

### Step 5: Verify Success

You should see a success message. Now verify the tables were created:

**Run this verification query:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'player_statistics',
  'achievements',
  'user_achievements',
  'tournament_brackets',
  'teams',
  'team_members'
);
```

**Expected Result:** 6 rows showing all 6 tables

### Step 6: Verify Achievements Seeded

**Run this query:**
```sql
SELECT COUNT(*) as total_achievements FROM achievements;
```

**Expected Result:** 15 achievements

**View all achievements:**
```sql
SELECT name, category, rarity, points 
FROM achievements 
ORDER BY category, points;
```

---

## What Gets Created

### 6 New Tables:
1. ✅ `player_statistics` - Player performance metrics
2. ✅ `achievements` - Achievement definitions
3. ✅ `user_achievements` - User progress tracking
4. ✅ `tournament_brackets` - Tournament bracket structure
5. ✅ `teams` - Team information
6. ✅ `team_members` - Team membership

### 3 Database Functions:
1. ✅ `update_player_statistics()` - Auto-update stats after tournaments
2. ✅ `check_achievements()` - Check and unlock achievements
3. ✅ `generate_tournament_bracket()` - Generate bracket structure

### Security & Performance:
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for fast queries
- ✅ Automatic triggers
- ✅ 15 achievements pre-seeded

---

## After Migration Success

### Step 1: Regenerate TypeScript Types

Run this command to fix all TypeScript errors:

```bash
npx supabase gen types typescript --project-id xukowavzxgnjukalxjjv > src/integrations/supabase/types.ts
```

This will:
- ✅ Add new table types
- ✅ Fix TypeScript errors in hooks
- ✅ Update type definitions

### Step 2: Restart TypeScript Server

In VS Code:
1. Press `Ctrl+Shift+P`
2. Type "TypeScript: Restart TS Server"
3. Press Enter

### Step 3: Verify No TypeScript Errors

Check these files should have no errors:
- `src/hooks/usePlayerStats.ts`
- `src/hooks/useAchievements.ts`
- `src/hooks/useBrackets.ts`
- `src/hooks/useTeams.ts`

### Step 4: Test the Hooks

Create a test component:

```typescript
import { usePlayerStatistics } from '@/hooks/usePlayerStats';
import { useAchievementsWithProgress } from '@/hooks/useAchievements';
import { useAuth } from '@/contexts/AuthContext';

function TestNewFeatures() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = usePlayerStatistics(user?.id);
  const { data: achievements, isLoading: achievementsLoading } = useAchievementsWithProgress(user?.id);
  
  if (statsLoading || achievementsLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Player Stats</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
      
      <h2>Achievements</h2>
      <p>Unlocked: {achievements?.unlocked.length}</p>
      <p>Locked: {achievements?.locked.length}</p>
      <p>Total Points: {achievements?.totalPoints}</p>
    </div>
  );
}
```

---

## Troubleshooting

### Error: "relation already exists"

**Solution:** Tables might already exist. Check if they're correct:
```sql
\d player_statistics
\d achievements
\d teams
```

If they're wrong, drop and recreate:
```sql
DROP TABLE IF EXISTS player_statistics CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS tournament_brackets CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;

-- Then run the migration again
```

### Error: "permission denied"

**Solution:** Check you're logged in as the project owner or have admin access.

### Error: "syntax error"

**Solution:** Make sure you copied the ENTIRE migration file, including all comments.

---

## Alternative: Use Supabase CLI (If You Have Access Token)

If you have a Supabase access token:

1. **Login to Supabase:**
   ```bash
   npx supabase login
   ```

2. **Link Project:**
   ```bash
   npx supabase link --project-ref xukowavzxgnjukalxjjv
   ```

3. **Push Migration:**
   ```bash
   npx supabase db push
   ```

---

## Quick Checklist

After running the migration:

- [ ] 6 tables created
- [ ] 15 achievements seeded
- [ ] 3 functions created
- [ ] RLS policies active
- [ ] Indexes created
- [ ] TypeScript types regenerated
- [ ] No TypeScript errors
- [ ] Hooks return data

---

## Summary

**Easiest Method:** Use Supabase Dashboard SQL Editor
1. Copy migration SQL
2. Paste into SQL Editor
3. Click Run
4. Verify tables created
5. Regenerate types

**Total Time:** ~5 minutes

---

**Ready to deploy? Follow the steps above!** 🚀
