# 🚀 Deployment Instructions for New Features

## Current Status
The Supabase CLI is being installed via `npx supabase db push`. Once installation completes, the migration will run automatically.

---

## Option 1: Automatic Deployment (In Progress)

The command `npx supabase db push` is currently running. It will:
1. ✅ Install Supabase CLI (in progress)
2. ⏳ Connect to your Supabase project
3. ⏳ Apply the migration file
4. ⏳ Create all 6 new tables
5. ⏳ Seed 15 achievements

**Wait for the command to complete...**

---

## Option 2: Manual Deployment (If Automatic Fails)

### Via Supabase Dashboard:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open: `supabase/migrations/20251007000000_add_new_features.sql`
   - Copy ALL contents (entire file)

4. **Execute Migration**
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for success message

5. **Verify Tables Created**
   Run this query to verify:
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
   Should return 6 rows.

6. **Verify Achievements Seeded**
   ```sql
   SELECT COUNT(*) FROM achievements;
   ```
   Should return 15.

---

## After Migration Completes

### Step 1: Regenerate Supabase Types

Run this command to fix TypeScript errors:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

**Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.**

To find your project ID:
1. Go to Supabase Dashboard
2. Click on your project
3. Go to Settings → General
4. Copy "Reference ID"

### Step 2: Verify TypeScript Errors Fixed

After regenerating types, all TypeScript errors in these files should be resolved:
- `src/hooks/usePlayerStats.ts`
- `src/hooks/useAchievements.ts`
- `src/hooks/useBrackets.ts`
- `src/hooks/useTeams.ts`

### Step 3: Test the Hooks

Create a simple test component to verify hooks work:

```typescript
import { usePlayerStatistics } from '@/hooks/usePlayerStats';
import { useAchievementsWithProgress } from '@/hooks/useAchievements';

function TestComponent() {
  const { data: stats } = usePlayerStatistics(userId);
  const { data: achievements } = useAchievementsWithProgress(userId);
  
  console.log('Stats:', stats);
  console.log('Achievements:', achievements);
  
  return <div>Check console for data</div>;
}
```

---

## Troubleshooting

### Issue: Migration Fails

**Error: "relation already exists"**
- Some tables might already exist
- Safe to ignore if tables are correct
- Or drop tables and re-run migration

**Error: "permission denied"**
- Check Supabase project permissions
- Ensure you're logged in to correct project

**Error: "syntax error"**
- Check SQL file for corruption
- Re-copy from repository

### Issue: TypeScript Errors Persist

**After regenerating types:**
1. Restart TypeScript server in VS Code
   - Press `Ctrl+Shift+P`
   - Type "TypeScript: Restart TS Server"
   - Press Enter

2. Clear node_modules and reinstall
   ```bash
   rm -rf node_modules
   npm install
   ```

3. Restart VS Code completely

### Issue: Hooks Return No Data

**Check database:**
```sql
-- Check if tables exist
SELECT * FROM player_statistics LIMIT 1;
SELECT * FROM achievements LIMIT 1;
SELECT * FROM teams LIMIT 1;
```

**Check RLS policies:**
- Ensure you're authenticated
- Check if RLS policies allow access
- Test with Supabase Dashboard

---

## Verification Checklist

After deployment, verify:

- [ ] All 6 tables created
- [ ] 15 achievements seeded
- [ ] RLS policies active
- [ ] Indexes created
- [ ] Functions created (3 total)
- [ ] Triggers active
- [ ] TypeScript errors resolved
- [ ] Hooks return data

---

## Next Steps After Successful Deployment

1. **Build UI Components**
   - Statistics dashboard
   - Achievement cards
   - Bracket visualization
   - Team management

2. **Create Pages**
   - `/statistics` - Player stats page
   - `/achievements` - Achievements page
   - `/tournaments/:id/bracket` - Bracket view
   - `/teams` - Teams page

3. **Update Navigation**
   - Add links to new pages
   - Update hamburger menu
   - Update bottom navigation

4. **Test Everything**
   - Complete a tournament
   - Check if stats update
   - Verify achievements unlock
   - Test bracket generation
   - Create and manage teams

---

## Support

If you encounter issues:

1. Check the migration file: `supabase/migrations/20251007000000_add_new_features.sql`
2. Review documentation: `FEATURES_IMPLEMENTATION_COMPLETE.md`
3. Check implementation plan: `IMPLEMENTATION_PLAN.md`

---

**Current Status:** Waiting for Supabase CLI installation to complete...
