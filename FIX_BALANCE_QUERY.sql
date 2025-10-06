-- SQL Query to Check and Fix Balance for Specific User
-- Run this in Supabase SQL Editor

-- 1. Check current balance for the logged-in user
SELECT 
    user_id,
    amount as current_balance,
    updated_at
FROM user_balances 
WHERE user_id = '2774b5ad-b60e-44f4-b230-6524ef3f79df';

-- 2. Check all transactions for this user to calculate correct balance
SELECT 
    type,
    amount,
    description,
    balance_after,
    created_at
FROM transactions 
WHERE user_id = '2774b5ad-b60e-44f4-b230-6524ef3f79df'
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check pending/approved deposits
SELECT 
    amount,
    status,
    created_at,
    approved_at
FROM deposits 
WHERE user_id = '2774b5ad-b60e-44f4-b230-6524ef3f79df'
ORDER BY created_at DESC;

-- 4. Check withdrawals
SELECT 
    amount,
    status,
    created_at
FROM withdrawals 
WHERE user_id = '2774b5ad-b60e-44f4-b230-6524ef3f79df'
ORDER BY created_at DESC;

-- 5. If you need to RESET the balance to 0 (USE WITH CAUTION!)
-- Uncomment the line below to reset balance to 0
-- UPDATE user_balances SET amount = 0, updated_at = NOW() WHERE user_id = '2774b5ad-b60e-44f4-b230-6524ef3f79df';

-- 6. If you need to SET a specific balance (USE WITH CAUTION!)
-- Replace XXX with the correct amount
-- UPDATE user_balances SET amount = XXX, updated_at = NOW() WHERE user_id = '2774b5ad-b60e-44f4-b230-6524ef3f79df';

-- 7. Verify the update
-- SELECT * FROM user_balances WHERE user_id = '2774b5ad-b60e-44f4-b230-6524ef3f79df';
