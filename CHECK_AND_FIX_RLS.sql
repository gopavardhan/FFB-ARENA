-- Check current RLS policies on user_balances table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_balances';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_balances';

-- If RLS is blocking updates, add a policy to allow service role to update
-- This allows the backend to update balances
CREATE POLICY IF NOT EXISTS "Allow service role to update balances"
ON user_balances
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Also ensure INSERT policy exists for creating new balance records
CREATE POLICY IF NOT EXISTS "Allow service role to insert balances"
ON user_balances
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Check transactions table policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'transactions';

-- Add policy for transactions if needed
CREATE POLICY IF NOT EXISTS "Allow authenticated to insert transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Test query to see if we can update a balance
-- Replace USER_ID with actual user ID
-- SELECT * FROM user_balances WHERE user_id = 'USER_ID';
-- UPDATE user_balances SET amount = amount + 100 WHERE user_id = 'USER_ID';
