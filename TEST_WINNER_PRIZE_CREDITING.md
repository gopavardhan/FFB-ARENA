# 🏆 Test Winner Prize Auto-Crediting

## Test: Verify Automatic Prize Credit When Admin Declares Winner

This guide will help you test if the winning amount is automatically credited to the winner's account when an admin submits match results.

---

## 📋 Prerequisites

Before testing, ensure:
- ✅ You have an admin account
- ✅ There's an active or completed tournament
- ✅ At least one player is registered for the tournament
- ✅ The tournament has a prize amount set

---

## 🧪 Test Steps

### Step 1: Check Database Function Exists

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar

3. **Run this query to verify function exists:**
   ```sql
   SELECT routine_name, routine_type
   FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name = 'distribute_tournament_prizes';
   ```

4. **Expected Result:**
   - Should return 1 row showing the function exists
   - If no results, the function needs to be created

---

### Step 2: Prepare Test Data

#### A. Check Player's Current Balance

1. **In Supabase SQL Editor, run:**
   ```sql
   -- Replace 'PLAYER_USER_ID' with actual player's user ID
   SELECT 
     user_id,
     amount as current_balance
   FROM user_balances
   WHERE user_id = 'PLAYER_USER_ID';
   ```

2. **Note down the current balance** (e.g., ₹100.00)

#### B. Check Tournament Details

1. **Run this query:**
   ```sql
   -- Replace 'TOURNAMENT_ID' with actual tournament ID
   SELECT 
     id,
     name,
     entry_fee,
     prize_pool,
     prize_distribution,
     status
   FROM tournaments
   WHERE id = 'TOURNAMENT_ID';
   ```

2. **Note down:**
   - Prize pool amount
   - Prize distribution (should show winner gets 100% or specific amount)
   - Tournament status

#### C. Verify Player is Registered

1. **Run this query:**
   ```sql
   SELECT 
     user_id,
     in_game_name,
     slot_number
   FROM tournament_registrations
   WHERE tournament_id = 'TOURNAMENT_ID'
   AND user_id = 'PLAYER_USER_ID';
   ```

2. **Confirm player is registered**

---

### Step 3: Declare Winner (Admin Action)

#### In the Application:

1. **Login as Admin**
   - Go to http://localhost:8081/auth
   - Login with admin credentials

2. **Navigate to Tournament Management**
   - Click hamburger menu (☰)
   - Go to "Tournament Management"

3. **Find the Tournament**
   - Locate the tournament you want to test
   - Click "Declare Winner" or "Results" button

4. **Select Winner**
   - Choose the player from dropdown
   - You should see the prize amount displayed (e.g., ₹500)

5. **Click "Declare Winner & Distribute Prize"**
   - Wait for success message
   - Message should say: "Winner declared! Prize of ₹XXX credited to winner's account."

---

### Step 4: Verify Prize Was Credited

#### A. Check in Application UI

1. **Login as the Winner Player**
   - Logout from admin account
   - Login with winner's account

2. **Check Balance**
   - Look at balance in header
   - OR go to Wallet page
   - **Expected:** Balance should have increased by prize amount

3. **Check Transaction History**
   - Go to Wallet page
   - Click "Transactions" tab
   - **Expected:** Should see a new transaction:
     - Type: "tournament_win"
     - Amount: Prize amount (green/positive)
     - Description: Tournament name

#### B. Verify in Database

1. **Check Updated Balance:**
   ```sql
   SELECT 
     user_id,
     amount as new_balance,
     updated_at
   FROM user_balances
   WHERE user_id = 'PLAYER_USER_ID';
   ```

2. **Expected Result:**
   - `new_balance` = `old_balance` + `prize_amount`
   - `updated_at` should be recent timestamp

3. **Check Transaction Record:**
   ```sql
   SELECT 
     id,
     user_id,
     type,
     amount,
     description,
     created_at
   FROM transactions
   WHERE user_id = 'PLAYER_USER_ID'
   AND type = 'tournament_win'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

4. **Expected Result:**
   - New transaction with type 'tournament_win'
   - Amount matches prize
   - Description includes tournament name
   - Recent timestamp

5. **Check Tournament Result:**
   ```sql
   SELECT 
     tournament_id,
     user_id,
     rank,
     prize_amount,
     created_at
   FROM tournament_results
   WHERE tournament_id = 'TOURNAMENT_ID'
   AND rank = 1;
   ```

6. **Expected Result:**
   - Winner's user_id recorded
   - Rank = 1
   - Prize amount matches
   - Recent timestamp

---

## ✅ Success Criteria

The automatic prize crediting is working if:

1. ✅ **Admin can declare winner** without errors
2. ✅ **Success message appears** with correct prize amount
3. ✅ **Winner's balance increases** by exact prize amount
4. ✅ **Transaction is created** with type 'tournament_win'
5. ✅ **Tournament result is recorded** with rank 1
6. ✅ **Tournament status changes** to 'completed'
7. ✅ **Balance updates in real-time** (visible immediately)

---

## 🧮 Example Calculation

### Before:
- Player Balance: ₹100.00
- Tournament Prize: ₹500.00

### After Admin Declares Winner:
- Player Balance: ₹600.00 (₹100 + ₹500)
- New Transaction: +₹500.00 (tournament_win)
- Tournament Status: completed

---

## 🐛 Troubleshooting

### Issue 1: "Function not found" error

**Cause:** Database function `distribute_tournament_prizes` doesn't exist

**Fix:** Run this SQL in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION distribute_tournament_prizes(
  p_tournament_id UUID,
  p_admin_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result RECORD;
  v_total_distributed DECIMAL(10,2) := 0;
  v_tournament RECORD;
BEGIN
  -- Get tournament details
  SELECT * INTO v_tournament
  FROM tournaments
  WHERE id = p_tournament_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tournament not found';
  END IF;

  -- Process each result and credit prizes
  FOR v_result IN
    SELECT 
      tr.user_id,
      tr.prize_amount,
      tr.rank
    FROM tournament_results tr
    WHERE tr.tournament_id = p_tournament_id
    AND tr.prize_amount > 0
  LOOP
    -- Credit the prize to user's balance
    UPDATE user_balances
    SET 
      amount = amount + v_result.prize_amount,
      updated_at = NOW()
    WHERE user_id = v_result.user_id;

    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      description,
      status
    ) VALUES (
      v_result.user_id,
      'tournament_win',
      v_result.prize_amount,
      'Prize for ' || v_tournament.name || ' (Rank ' || v_result.rank || ')',
      'success'
    );

    v_total_distributed := v_total_distributed + v_result.prize_amount;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'total_distributed', v_total_distributed
  );
END;
$$;
```

### Issue 2: Balance not updating

**Possible Causes:**
1. User doesn't have a balance record
2. RLS policies blocking update
3. Function not executing

**Fix:**
```sql
-- Check if user has balance record
SELECT * FROM user_balances WHERE user_id = 'PLAYER_USER_ID';

-- If no record, create one:
INSERT INTO user_balances (user_id, amount)
VALUES ('PLAYER_USER_ID', 0.00);

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_balances';
```

### Issue 3: Transaction not created

**Check:**
```sql
-- Verify transactions table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions';

-- Check if transaction was created but failed
SELECT * FROM transactions 
WHERE user_id = 'PLAYER_USER_ID'
ORDER BY created_at DESC
LIMIT 5;
```

### Issue 4: "Winner already declared" error

**Cause:** Trying to declare winner twice

**Fix:** This is intentional to prevent duplicate prize distribution. If you need to test again:
```sql
-- Delete existing result (ONLY FOR TESTING)
DELETE FROM tournament_results 
WHERE tournament_id = 'TOURNAMENT_ID' 
AND rank = 1;

-- Also delete the transaction
DELETE FROM transactions 
WHERE user_id = 'PLAYER_USER_ID'
AND type = 'tournament_win'
AND description LIKE '%TOURNAMENT_NAME%';

-- Restore original balance
UPDATE user_balances 
SET amount = amount - PRIZE_AMOUNT
WHERE user_id = 'PLAYER_USER_ID';
```

---

## 📊 Quick Test Script

Run this in Supabase SQL Editor for a complete check:

```sql
-- Replace these values:
-- TOURNAMENT_ID: Your tournament ID
-- PLAYER_USER_ID: Winner's user ID

-- 1. Check current balance
SELECT 'Current Balance:' as step, amount 
FROM user_balances 
WHERE user_id = 'PLAYER_USER_ID';

-- 2. Check tournament prize
SELECT 'Tournament Prize:' as step, prize_pool, prize_distribution 
FROM tournaments 
WHERE id = 'TOURNAMENT_ID';

-- 3. Check if winner declared
SELECT 'Winner Declared:' as step, user_id, prize_amount 
FROM tournament_results 
WHERE tournament_id = 'TOURNAMENT_ID' 
AND rank = 1;

-- 4. Check transaction
SELECT 'Transaction Created:' as step, type, amount, description 
FROM transactions 
WHERE user_id = 'PLAYER_USER_ID' 
AND type = 'tournament_win'
ORDER BY created_at DESC 
LIMIT 1;

-- 5. Verify balance increased
SELECT 'Balance After:' as step, amount 
FROM user_balances 
WHERE user_id = 'PLAYER_USER_ID';
```

---

## 🎯 Expected Flow

```
1. Admin clicks "Declare Winner"
   ↓
2. Admin selects winner from dropdown
   ↓
3. Admin clicks "Declare Winner & Distribute Prize"
   ↓
4. Frontend calls: supabase.rpc('distribute_tournament_prizes')
   ↓
5. Database function executes:
   - Creates tournament_result record (rank 1)
   - Updates user_balances (adds prize amount)
   - Creates transaction record (type: tournament_win)
   - Returns total_distributed amount
   ↓
6. Frontend shows success message
   ↓
7. Winner sees updated balance immediately (real-time)
```

---

## ✅ Final Verification Checklist

- [ ] Database function `distribute_tournament_prizes` exists
- [ ] Admin can access Tournament Results page
- [ ] Admin can select winner from dropdown
- [ ] Prize amount is displayed correctly
- [ ] "Declare Winner" button works
- [ ] Success message appears with correct amount
- [ ] Winner's balance increases by prize amount
- [ ] Transaction record is created
- [ ] Tournament result is recorded
- [ ] Tournament status changes to 'completed'
- [ ] Balance updates in real-time
- [ ] Cannot declare winner twice (protection works)

---

**If all checks pass, the automatic prize crediting is working perfectly!** ✅🏆💰
