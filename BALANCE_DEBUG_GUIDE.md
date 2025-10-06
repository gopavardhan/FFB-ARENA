# Balance Display Debugging Guide

## Issue: Balance not showing correctly

### Step 1: Check Browser Console

1. Open the application at http://localhost:8080/
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Look for these logs:

**Expected Logs on Page Load:**
```
🔔 Setting up realtime subscription for user balance: [user-id]
📡 Balance subscription status: SUBSCRIBED
✅ Successfully subscribed to balance changes
🔄 Fetching balance for user: [user-id]
✅ Balance fetched: {user_id: "...", amount: X, ...}
```

**If you see errors:**
- ❌ Error fetching balance → Database connection issue
- ❌ Error subscribing → Supabase realtime not enabled
- No logs at all → Hook not being called

---

### Step 2: Check Database Directly

Run this query in Supabase SQL Editor:

```sql
-- Check if user_balances table exists and has data
SELECT * FROM user_balances WHERE user_id = 'YOUR_USER_ID';

-- Check if realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Expected Results:**
- Should return a row with your user_id and current balance
- user_balances should be in the realtime publication

---

### Step 3: Test Balance Query Manually

In browser console, run:

```javascript
// Get current user
const { data: { user } } = await supabase.auth.getUser();
console.log("Current user:", user.id);

// Query balance directly
const { data, error } = await supabase
  .from('user_balances')
  .select('*')
  .eq('user_id', user.id)
  .single();

console.log("Balance data:", data);
console.log("Balance error:", error);
```

**Expected Output:**
```javascript
Balance data: {
  user_id: "...",
  amount: 1234.56,
  created_at: "...",
  updated_at: "..."
}
Balance error: null
```

---

### Step 4: Check React Query Cache

In browser console, run:

```javascript
// Check if React Query is working
console.log("Query Client:", window.__REACT_QUERY_DEVTOOLS__);

// Or manually check the cache
const queryClient = window.__REACT_QUERY_CLIENT__;
if (queryClient) {
  const cache = queryClient.getQueryCache();
  console.log("All queries:", cache.getAll());
  
  // Find balance query
  const balanceQuery = cache.getAll().find(q => 
    q.queryKey[0] === 'user_balance'
  );
  console.log("Balance query:", balanceQuery);
  console.log("Balance data:", balanceQuery?.state?.data);
}
```

---

### Step 5: Monitor Real-Time Updates

1. Keep console open
2. In another tab/window, log in as BOSS
3. Approve a deposit for your player account
4. Switch back to player tab

**Expected Logs:**
```
💰 Balance update received: {...}
💰 Event type: UPDATE
💰 New balance: {amount: NEW_AMOUNT}
💰 Old balance: {amount: OLD_AMOUNT}
🔄 Fetching balance for user: [user-id]
✅ Balance fetched: {amount: NEW_AMOUNT}
✅ Balance cache updated and refetched
```

---

### Step 6: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to Supabase

**Expected Requests:**
- Every 5 seconds: POST to `/rest/v1/user_balances`
- Response should contain current balance
- Status: 200 OK

**If you see:**
- 401 Unauthorized → Authentication issue
- 403 Forbidden → RLS policy issue
- 404 Not Found → Table doesn't exist
- 500 Server Error → Database error

---

### Step 7: Verify RLS Policies

Run in Supabase SQL Editor:

```sql
-- Check RLS policies for user_balances
SELECT * FROM pg_policies WHERE tablename = 'user_balances';

-- Test if current user can read their balance
SELECT * FROM user_balances WHERE user_id = auth.uid();
```

---

### Common Issues & Solutions

#### Issue 1: Balance shows 0.00 but should have money
**Cause:** User balance record doesn't exist
**Solution:**
```sql
-- Create balance record
INSERT INTO user_balances (user_id, amount)
VALUES ('YOUR_USER_ID', 0.00)
ON CONFLICT (user_id) DO NOTHING;
```

#### Issue 2: Balance not updating after deposit approval
**Cause:** Realtime subscription not working
**Solution:**
1. Check if realtime is enabled in Supabase dashboard
2. Verify REPLICA IDENTITY is set:
```sql
ALTER TABLE user_balances REPLICA IDENTITY FULL;
```
3. Verify table is in publication:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE user_balances;
```

#### Issue 3: Console shows "Error fetching balance"
**Cause:** RLS policy blocking access
**Solution:**
```sql
-- Ensure policy exists
CREATE POLICY "Users can view their own balance"
ON user_balances FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

#### Issue 4: Balance updates but UI doesn't refresh
**Cause:** React Query cache issue
**Solution:** Already fixed with `gcTime: 0` and `staleTime: 0`

#### Issue 5: Multiple balance values showing
**Cause:** Multiple queries with different user IDs
**Solution:** Check that `user?.id` is consistent

---

### Step 8: Force Refresh Test

In browser console:

```javascript
// Force invalidate all balance queries
const queryClient = window.__REACT_QUERY_CLIENT__;
if (queryClient) {
  await queryClient.invalidateQueries({ queryKey: ['user_balance'] });
  await queryClient.refetchQueries({ queryKey: ['user_balance'] });
  console.log("✅ Forced balance refresh");
}
```

---

### Step 9: Check Component Rendering

Add this temporarily to Wallet.tsx:

```typescript
console.log("Wallet render - Balance data:", balance);
console.log("Wallet render - Balance loading:", balanceLoading);
console.log("Wallet render - User ID:", user?.id);
```

**Expected Output:**
```
Wallet render - Balance data: {amount: 1234.56, ...}
Wallet render - Balance loading: false
Wallet render - User ID: "abc-123-..."
```

---

### Step 10: Test Polling

Wait 5 seconds and check console. You should see:

```
🔄 Fetching balance for user: [user-id]
✅ Balance fetched: {amount: X}
```

This should repeat every 5 seconds.

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Console shows subscription logs
- [ ] Console shows "SUBSCRIBED" status
- [ ] Console shows balance fetch logs every 5 seconds
- [ ] Network tab shows requests every 5 seconds
- [ ] Database has user_balances record
- [ ] Realtime is enabled on user_balances table
- [ ] RLS policies allow user to read their balance
- [ ] No errors in console
- [ ] Balance data is not null/undefined
- [ ] User ID is correct and consistent

---

## Report Template

After debugging, provide this information:

```
### Balance Debug Report

**User ID:** [your user id]

**Console Logs:**
[paste relevant console logs]

**Balance Query Result:**
[paste result from Step 3]

**Network Requests:**
[screenshot or description]

**Database Check:**
[result from Step 2]

**Errors:**
[any errors you see]

**Current Balance Showing:** [what you see]
**Expected Balance:** [what it should be]
```

---

## Next Steps

Based on your findings:

1. **If subscription not working** → Check Supabase realtime settings
2. **If query returns null** → Check database and RLS policies
3. **If data correct but UI not updating** → Check React component
4. **If polling not happening** → Check React Query configuration

Please run through these steps and let me know what you find!
