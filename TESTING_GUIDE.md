# Real-Time Updates Testing Guide

## Prerequisites
✅ Development server is running at: http://localhost:8080/
✅ All real-time updates have been implemented

---

## Testing Checklist

### 🔐 Setup (5 minutes)
1. Open http://localhost:8080/ in your browser
2. Open Browser DevTools (F12) → Console tab
3. Log in with test accounts:
   - **Player Account**: (your test player credentials)
   - **Boss Account**: (your test boss credentials)
   - **Admin Account**: (your test admin credentials)

---

## Part 1: Player Features Testing (20 minutes)

### Test 1.1: Balance Display - Real-Time Updates
**Location:** Header, Dashboard, Wallet Page

**Steps:**
1. Log in as a player
2. Note the current balance in the header (top right)
3. Open browser console and look for: `"Setting up realtime subscription for user balance"`
4. Wait 5 seconds and watch the console for: `"Balance update received"`
5. Navigate to Dashboard → Check balance in StatCard
6. Navigate to Wallet page → Check balance in main card
7. **Expected:** Balance should be identical across all 3 locations

**Console Logs to Monitor:**
```
Setting up realtime subscription for user balance: [user-id]
Balance subscription status: SUBSCRIBED
Successfully subscribed to balance changes
```

---

### Test 1.2: Balance Update After Deposit
**Location:** Wallet Page, Header

**Steps:**
1. As player, go to Wallet page
2. Note current balance
3. Click "Add Money" button
4. Fill deposit form (amount, UTR, upload screenshot)
5. Submit deposit request
6. **In another browser tab/window**, log in as BOSS
7. As boss, go to Deposit Approvals
8. Approve the deposit
9. **Switch back to player tab**
10. Watch the balance update automatically (within 5 seconds)

**Expected Results:**
- ✅ Balance updates in header without refresh
- ✅ Balance updates in wallet page without refresh
- ✅ Console shows: `"Balance update received"`
- ✅ Toast notification appears: "Deposit Approved"

---

### Test 1.3: Transactions Tab - Real-Time Updates
**Location:** Wallet Page → Transactions Tab

**Steps:**
1. Go to Wallet page → Transactions tab
2. Note the transaction list
3. Wait 15 seconds (transaction refetch interval)
4. Console should show query refetch
5. Perform any transaction (deposit/withdrawal/tournament join)
6. Wait up to 15 seconds
7. **Expected:** New transaction appears automatically

---

### Test 1.4: Deposits Tab - Real-Time Updates
**Location:** Wallet Page → Deposits Tab

**Steps:**
1. Go to Wallet page → Deposits tab
2. Submit a new deposit request
3. Watch the list update automatically
4. Have boss approve/reject the deposit
5. **Expected:** Status updates from "pending" to "approved"/"rejected" within 12 seconds
6. **Expected:** Toast notification appears with status

---

### Test 1.5: Withdrawals Tab - Real-Time Updates
**Location:** Wallet Page → Withdrawals Tab

**Steps:**
1. Go to Wallet page → Withdrawals tab
2. Click "Withdraw" button
3. Submit withdrawal request
4. **Expected:** Amount deducted from balance immediately
5. **Expected:** Withdrawal appears in list with "pending" status
6. Have boss approve/cancel the withdrawal
7. **Expected:** Status updates automatically within 12 seconds

---

### Test 1.6: Tournament List - Real-Time Updates
**Location:** Tournaments Page

**Steps:**
1. Go to Tournaments page
2. Note the tournament list
3. Console should show: `"Setting up realtime subscription for tournaments"`
4. **In another tab**, have admin create a new tournament
5. **Expected:** New tournament appears in list within 10 seconds
6. Watch slot count update as other players register
7. **Expected:** Filled slots update automatically

**Console Logs:**
```
Setting up realtime subscription for tournaments
Tournament subscription status: SUBSCRIBED
Tournament update received: [payload]
```

---

### Test 1.7: Tournament Registration - Real-Time
**Location:** Tournament Details Page

**Steps:**
1. Go to any tournament with available slots
2. Note the slot count (e.g., "5/100 slots filled")
3. Click "Register" button
4. Fill in-game name and submit
5. **Expected:** Balance deducts immediately
6. **Expected:** Slot count updates (e.g., "6/100 slots filled")
7. **Expected:** Registration appears in "Joined Tournaments" tab on Dashboard

---

### Test 1.8: Activity Feed - Real-Time Updates
**Location:** Dashboard → Recent Activity Tab

**Steps:**
1. Go to Dashboard
2. Click "Recent Activity" tab
3. Perform any action (deposit, withdrawal, tournament join)
4. Wait up to 20 seconds
5. **Expected:** New activity appears in feed automatically

---

### Test 1.9: Window Focus/Blur Behavior
**Location:** Any Page

**Steps:**
1. Open the app in one tab
2. Switch to another tab/application (blur)
3. Wait 30 seconds
4. Switch back to the app tab (focus)
5. **Expected:** All data refetches immediately
6. Console should show multiple refetch logs

---

## Part 2: Boss Features Testing (15 minutes)

### Test 2.1: Boss Dashboard - Pending Counts
**Location:** Boss Dashboard

**Steps:**
1. Log in as boss
2. Go to Boss Dashboard
3. Note the pending counts (deposits, withdrawals)
4. Console should show: `"Setting up realtime subscription for deposits/withdrawals"`
5. **In another tab**, have a player submit a deposit
6. **Expected:** Pending deposit count increases within 3 seconds
7. Approve the deposit
8. **Expected:** Pending count decreases within 3 seconds

**Console Logs:**
```
Setting up realtime subscription for deposits/withdrawals
Payment updates subscription status: SUBSCRIBED
Deposit update received: [payload]
```

---

### Test 2.2: Deposit Approvals - Real-Time List
**Location:** Boss → Deposit Approvals

**Steps:**
1. Go to Deposit Approvals page
2. Note the pending deposits list
3. Have a player submit a new deposit
4. **Expected:** New deposit appears in list within 12 seconds
5. Approve a deposit
6. **Expected:** Deposit moves to approved status
7. **Expected:** Player receives toast notification

---

### Test 2.3: Withdrawal Approvals - Real-Time List
**Location:** Boss → Withdrawal Approvals

**Steps:**
1. Go to Withdrawal Approvals page
2. Note the pending withdrawals list
3. Have a player submit a withdrawal
4. **Expected:** New withdrawal appears within 12 seconds
5. Approve or cancel the withdrawal
6. **Expected:** Status updates immediately
7. **Expected:** Player receives toast notification

---

## Part 3: Admin Features Testing (10 minutes)

### Test 3.1: Tournament Management - Real-Time
**Location:** Admin → Tournament Management

**Steps:**
1. Log in as admin
2. Go to Tournament Management
3. Note the tournament list
4. Create a new tournament
5. **Expected:** Tournament appears in list immediately
6. Watch registration count update as players join
7. **Expected:** Filled slots update within 10 seconds

---

### Test 3.2: Admin Dashboard - Activity Feed
**Location:** Admin Dashboard

**Steps:**
1. Go to Admin Dashboard
2. Check the activity feed
3. Create a tournament or have players register
4. **Expected:** Activities appear in feed automatically

---

## Part 4: Edge Cases & Performance (10 minutes)

### Test 4.1: Multiple Tabs
**Steps:**
1. Open the app in 2 browser tabs
2. Log in as the same user in both
3. Perform an action in tab 1 (e.g., deposit)
4. **Expected:** Tab 2 updates automatically within polling interval

---

### Test 4.2: Network Reconnection
**Steps:**
1. Open the app
2. Open DevTools → Network tab
3. Set throttling to "Offline"
4. Wait 5 seconds
5. Set back to "Online"
6. **Expected:** All data refetches automatically
7. Console should show reconnection logs

---

### Test 4.3: Background Refetching
**Steps:**
1. Open the app
2. Minimize the browser window
3. Wait 30 seconds
4. Maximize the window
5. Check console logs
6. **Expected:** Queries continued refetching in background

---

### Test 4.4: Subscription Error Recovery
**Steps:**
1. Monitor console for subscription status
2. If you see "CHANNEL_ERROR"
3. **Expected:** Automatic resubscription attempt after 5 seconds
4. Console should show: `"Attempting to resubscribe"`

---

## Part 5: Performance Monitoring (5 minutes)

### Test 5.1: Console Log Verification
**Check for these logs:**
```
✅ Setting up realtime subscription for user balance
✅ Balance subscription status: SUBSCRIBED
✅ Setting up realtime subscription for tournaments
✅ Tournament subscription status: SUBSCRIBED
✅ Setting up realtime subscription for deposits/withdrawals
✅ Payment updates subscription status: SUBSCRIBED
```

### Test 5.2: Network Tab Monitoring
**Steps:**
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Watch for periodic API calls:
   - Balance queries every 5 seconds
   - Tournament queries every 10 seconds
   - Deposit/Withdrawal queries every 12 seconds
4. **Expected:** Regular polling without errors

### Test 5.3: Memory Usage
**Steps:**
1. Open DevTools → Performance Monitor
2. Let the app run for 5 minutes
3. **Expected:** Memory usage should be stable (no memory leaks)
4. **Expected:** No excessive CPU usage

---

## Success Criteria

### ✅ All Tests Pass If:
1. Balance updates across all pages without manual refresh
2. Transactions, deposits, withdrawals update automatically
3. Tournament lists and slot counts update in real-time
4. Boss dashboard counts update within 3 seconds
5. All Supabase subscriptions show "SUBSCRIBED" status
6. No console errors related to queries or subscriptions
7. Toast notifications appear for status changes
8. Window focus triggers immediate refetch
9. Network reconnection triggers refetch
10. Background refetching continues when tab is not focused

---

## Common Issues & Solutions

### Issue: Balance not updating
**Solution:** Check console for subscription status. Should see "SUBSCRIBED"

### Issue: "CHANNEL_ERROR" in console
**Solution:** Wait 5 seconds for automatic resubscription

### Issue: Data not refetching
**Solution:** Check network tab for API calls. Should see periodic requests

### Issue: Multiple subscriptions
**Solution:** Normal if multiple components use the same hook

---

## Refetch Intervals Reference

| Data Type | Interval | Stale Time |
|-----------|----------|------------|
| Balance | 5 seconds | 0 seconds |
| Boss Counts | 3 seconds | 1 second |
| Tournaments | 10 seconds | 5 seconds |
| Registrations | 8 seconds | 3 seconds |
| Deposits | 12 seconds | 8 seconds |
| Withdrawals | 12 seconds | 8 seconds |
| Transactions | 15 seconds | 10 seconds |
| Activities | 20 seconds | 15 seconds |

---

## Report Template

After testing, document your findings:

```
## Test Results

Date: [Date]
Tester: [Name]

### Passed Tests:
- [ ] Balance real-time updates
- [ ] Transaction updates
- [ ] Deposit/Withdrawal updates
- [ ] Tournament updates
- [ ] Boss dashboard counts
- [ ] Window focus behavior
- [ ] Network reconnection
- [ ] Background refetching

### Failed Tests:
[List any failures with details]

### Performance Notes:
[Any performance observations]

### Console Errors:
[Any errors found]

### Recommendations:
[Any suggestions for improvement]
```

---

## Next Steps After Testing

1. If all tests pass → Mark task as complete
2. If issues found → Document and fix
3. Adjust polling intervals if needed for performance
4. Consider adding loading indicators for better UX
