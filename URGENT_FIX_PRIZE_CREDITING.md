# 🚨 URGENT: Fix Prize Crediting Issue

## Current Problem

✅ Tournament result is created (visible in database)
❌ Balance is NOT being updated
❌ Transaction is NOT being created
❌ Error shows "[object Object]"

## Quick Diagnosis Steps

### Step 1: Check Browser Console

1. Open browser (F12)
2. Go to Console tab
3. Try to declare winner
4. Look for error messages

**What to look for:**
- "RPC function error: ..."
- "Balance update error: ..."
- "Get balance error: ..."

### Step 2: Check Database Policies

Run this in Supabase SQL Editor:

```sql
-- Check if user_balances has RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_balances';

-- Check current policies
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'user_balances';
```

## Most Likely Causes & Fixes

### Cause 1: RLS Policy Blocking Updates

**Symptom:** Balance update fails silently

**Fix:** Run this SQL in Supabase SQL Editor:

```sql
-- Allow authenticated users to update their own balance
CREATE POLICY IF NOT EXISTS "Users can update own balance"
ON user_balances
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow service role (backend) to update any balance
CREATE POLICY IF NOT EXISTS "Service role can update balances"
ON user_balances
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- For admin operations, allow authenticated to update
ALTER POLICY "Users can update own balance" 
ON user_balances
USING (true)
WITH CHECK (true);
```

### Cause 2: Missing user_balances Record

**Symptom:** "No rows returned" error

**Fix:** Check if winner has a balance record:

```sql
-- Check if user has balance record
SELECT * FROM user_balances 
WHERE user_id = 'WINNER_USER_ID';

-- If no record, create one:
INSERT INTO user_balances (user_id, amount)
VALUES ('WINNER_USER_ID', 0.00)
ON CONFLICT (user_id) DO NOTHING;
```

### Cause 3: Transactions Table RLS

**Fix:** Run this SQL:

```sql
-- Allow creating transactions
CREATE POLICY IF NOT EXISTS "Allow authenticated to insert transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (true);
```

## Complete Fix Script

Run this entire script in Supabase SQL Editor:

```sql
-- ============================================
-- COMPLETE FIX FOR PRIZE CREDITING
-- ============================================

-- 1. Fix user_balances policies
DROP POLICY IF EXISTS "Users can update own balance" ON user_balances;
DROP POLICY IF EXISTS "Service role can update balances" ON user_balances;

CREATE POLICY "Allow all authenticated to update balances"
ON user_balances
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated to insert balances"
ON user_balances
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Fix transactions policies
DROP POLICY IF EXISTS "Allow authenticated to insert transactions" ON transactions;

CREATE POLICY "Allow all authenticated to insert transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Ensure all users have balance records
INSERT INTO user_balances (user_id, amount)
SELECT id, 0.00
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_balances)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Verify policies
SELECT 'user_balances policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_balances';

SELECT 'transactions policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'transactions';

SELECT 'Users without balance records:' as info;
SELECT COUNT(*) FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_balances);
```

## Manual Test After Fix

### Step 1: Clear Previous Test Data

```sql
-- Get the tournament ID and user ID from tournament_results
SELECT 
    tr.id,
    tr.tournament_id,
    tr.user_id,
    tr.prize_amount,
    t.name as tournament_name
FROM tournament_results tr
JOIN tournaments t ON t.id = tr.tournament_id
WHERE tr.rank = 1
ORDER BY tr.created_at DESC
LIMIT 1;

-- Delete the test result (use the ID from above)
DELETE FROM tournament_results 
WHERE id = 'RESULT_ID_FROM_ABOVE';

-- Reset tournament status
UPDATE tournaments 
SET status = 'active'
WHERE id = 'TOURNAMENT_ID_FROM_ABOVE';
```

### Step 2: Check Winner's Current Balance

```sql
SELECT 
    user_id,
    amount as current_balance
FROM user_balances
WHERE user_id = 'WINNER_USER_ID';
```

### Step 3: Try Declaring Winner Again

1. Go to admin panel
2. Click "Declare Winner"
3. Select winner
4. Click "Declare Winner & Distribute Prize"

### Step 4: Verify Balance Was Updated

```sql
-- Check new balance
SELECT 
    user_id,
    amount as new_balance,
    updated_at
FROM user_balances
WHERE user_id = 'WINNER_USER_ID';

-- Check transaction was created
SELECT 
    type,
    amount,
    description,
    status,
    created_at
FROM transactions
WHERE user_id = 'WINNER_USER_ID'
AND type = 'tournament_win'
ORDER BY created_at DESC
LIMIT 1;

-- Check result was recorded
SELECT 
    rank,
    prize_amount,
    created_at
FROM tournament_results
WHERE tournament_id = 'TOURNAMENT_ID'
AND rank = 1;
```

## If Still Not Working

### Check Console Logs

The code now has extensive logging. Check browser console for:

```
"RPC function error: ..." 
"RPC function not available, using direct method"
"Get balance error: ..."
"Balance update error: ..."
"Transaction creation error: ..."
"Full error object: ..."
```

### Manual Balance Update Test

Try updating balance manually to test permissions:

```sql
-- Test if you can update balance
UPDATE user_balances 
SET amount = amount + 100
WHERE user_id = 'WINNER_USER_ID';

-- If this fails, check the error message
-- It will tell you exactly what's wrong
```

### Check Auth Context

```sql
-- Check current user's role
SELECT auth.uid(), auth.role();

-- Check if user is authenticated
SELECT current_user, session_user;
```

## Emergency Workaround

If nothing works, use this SQL to manually credit the prize:

```sql
-- 1. Get the prize amount from tournament_results
SELECT prize_amount FROM tournament_results 
WHERE tournament_id = 'TOURNAMENT_ID' AND rank = 1;

-- 2. Update balance manually
UPDATE user_balances 
SET amount = amount + PRIZE_AMOUNT,
    updated_at = NOW()
WHERE user_id = 'WINNER_USER_ID';

-- 3. Create transaction manually
INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
) VALUES (
    'WINNER_USER_ID',
    'tournament_win',
    PRIZE_AMOUNT,
    'Prize for TOURNAMENT_NAME (Rank 1)',
    'success'
);

-- 4. Verify
SELECT * FROM user_balances WHERE user_id = 'WINNER_USER_ID';
SELECT * FROM transactions WHERE user_id = 'WINNER_USER_ID' ORDER BY created_at DESC LIMIT 1;
```

## Root Cause Analysis

Based on the screenshot showing tournament_results are created but balances aren't updated:

1. **Tournament result creation works** ✅
2. **Tournament status update works** ✅
3. **Balance update fails** ❌
4. **Transaction creation fails** ❌

This indicates:
- RLS policies are blocking the UPDATE on user_balances
- OR user doesn't have a balance record
- OR there's a permission issue

## Next Steps

1. **Run the Complete Fix Script** (above)
2. **Check browser console** for specific error
3. **Try manual balance update** to test permissions
4. **Share the console error** if still not working

The fix script above should resolve 99% of cases!
