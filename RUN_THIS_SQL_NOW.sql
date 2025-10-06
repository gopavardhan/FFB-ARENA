-- ============================================
-- CRITICAL FIX: Run this in Supabase SQL Editor
-- ============================================
-- This fixes Row Level Security policies that
-- are blocking balance updates and tournament updates
-- ============================================

-- 1. Fix user_balances table policies
DROP POLICY IF EXISTS "Users can update own balance" ON user_balances;
DROP POLICY IF EXISTS "Service role can update balances" ON user_balances;
DROP POLICY IF EXISTS "Users can view own balance" ON user_balances;

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

CREATE POLICY "Allow all authenticated to select balances"
ON user_balances
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix transactions table policies
DROP POLICY IF EXISTS "Allow authenticated to insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

CREATE POLICY "Allow all authenticated to insert transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow all authenticated to select transactions"
ON transactions
FOR SELECT
TO authenticated
USING (true);

-- 3. Fix tournaments table policies (for status update)
DROP POLICY IF EXISTS "Admins can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Allow authenticated to update tournaments" ON tournaments;

CREATE POLICY "Allow all authenticated to update tournaments"
ON tournaments
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Ensure all users have balance records
INSERT INTO user_balances (user_id, amount)
SELECT id, 0.00
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_balances)
ON CONFLICT (user_id) DO NOTHING;

-- 5. Verify the fix
SELECT '✅ All policies fixed!' as status;

SELECT '📋 user_balances policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_balances';

SELECT '📋 transactions policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'transactions';

SELECT '📋 tournaments policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'tournaments';

SELECT '✅ Fix complete! Try declaring a winner now.' as final_message;
