# 🔌 Realtime Connections Explained - Why You Might Exceed Limits

## 🎯 The Issue Explained Simply

### What Are Realtime Connections?

Think of realtime connections like **phone lines**:
- Each user needs a "phone line" to receive instant updates
- Supabase free tier gives you **200 phone lines**
- Your app currently uses **3 phone lines per user**

### Current Setup (Problem):

```
User 1:
├─ Phone Line 1: Listening for balance changes
├─ Phone Line 2: Listening for deposit/withdrawal changes
└─ Phone Line 3: Listening for tournament changes

User 2:
├─ Phone Line 4: Listening for balance changes
├─ Phone Line 5: Listening for deposit/withdrawal changes
└─ Phone Line 6: Listening for tournament changes

...and so on

With 100 users:
100 users × 3 connections = 300 connections needed
But you only have 200 available ❌
```

---

## 📊 Current Implementation Analysis

### Your Code Currently Does This:

#### 1. In `src/pages/Index.tsx` (Dashboard):
```javascript
useRealtimeBalance(user?.id);              // Connection 1
useRealtimeTournaments();                  // Connection 2
useRealtimeDepositsWithdrawals(user?.id);  // Connection 3
```

#### 2. In `src/pages/Wallet.tsx`:
```javascript
useRealtimeBalance(user?.id);              // Connection 1 (duplicate!)
useRealtimeDepositsWithdrawals(user?.id);  // Connection 2 (duplicate!)
```

#### 3. In Other Pages:
Multiple pages might be calling these hooks simultaneously.

### The Math:

```
Scenario 1: User on Dashboard
├─ useRealtimeBalance: 1 connection
├─ useRealtimeTournaments: 1 connection
└─ useRealtimeDepositsWithdrawals: 1 connection
Total: 3 connections per user

With 67 users online: 67 × 3 = 201 connections ❌ EXCEEDS LIMIT!
With 100 users online: 100 × 3 = 300 connections ❌ WAY OVER!
```

---

## 🔍 Why This Happens

### Supabase Realtime Works Like This:

```javascript
// Each of these creates a SEPARATE connection:

// Connection 1: Balance channel
supabase
  .channel('balance-changes-user123')
  .on('postgres_changes', { table: 'user_balances' }, callback)
  .subscribe()

// Connection 2: Deposits/Withdrawals channel
supabase
  .channel('payment-updates-user123')
  .on('postgres_changes', { table: 'deposits' }, callback)
  .on('postgres_changes', { table: 'withdrawals' }, callback)
  .subscribe()

// Connection 3: Tournaments channel
supabase
  .channel('tournament-updates')
  .on('postgres_changes', { table: 'tournaments' }, callback)
  .subscribe()
```

Each `.channel()` and `.subscribe()` = **1 connection**

---

## ✅ The Solution: Combine Channels

### Instead of 3 Connections, Use 1:

```javascript
// ONE connection that listens to EVERYTHING:
supabase
  .channel(`user-updates-${userId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'user_balances',
    filter: `user_id=eq.${userId}`
  }, handleBalanceUpdate)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'deposits',
    filter: `user_id=eq.${userId}`
  }, handleDepositUpdate)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'withdrawals',
    filter: `user_id=eq.${userId}`
  }, handleWithdrawalUpdate)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tournaments'
  }, handleTournamentUpdate)
  .subscribe()
```

### The Math After Optimization:

```
With 1 connection per user:
├─ 100 users = 100 connections ✅
├─ 150 users = 150 connections ✅
└─ 200 users = 200 connections ✅ (at limit)

You can now support 200 concurrent users!
```

---

## 🎯 Real-World Example

### Scenario: 100 Users Online

#### BEFORE (Current - 3 connections per user):
```
User 1: 3 connections
User 2: 3 connections
User 3: 3 connections
...
User 100: 3 connections

Total: 300 connections
Limit: 200 connections
Result: ❌ EXCEEDS by 100 connections

What happens:
- First 66 users connect fine (66 × 3 = 198)
- User 67 tries to connect (needs 3 more = 201 total)
- Supabase rejects the connection ❌
- Users 67-100 don't get realtime updates
- They see stale data until they refresh
```

#### AFTER (Optimized - 1 connection per user):
```
User 1: 1 connection
User 2: 1 connection
User 3: 1 connection
...
User 100: 1 connection

Total: 100 connections
Limit: 200 connections
Result: ✅ SAFE (50% usage)

What happens:
- All 100 users connect successfully
- Everyone gets realtime updates
- Still have room for 100 more users
```

---

## 🔧 How to Implement the Fix

### Step 1: Create Combined Hook

Create `src/hooks/useRealtimeUpdates.ts`:

```javascript
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeUpdates = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    console.log("🔌 Setting up COMBINED realtime subscription for user:", userId);

    // ONE channel for ALL updates
    const channel = supabase
      .channel(`user-all-updates-${userId}`)
      
      // Listen to balance changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_balances",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("💰 Balance update:", payload);
          queryClient.invalidateQueries({ queryKey: ["user_balance", userId] });
        }
      )
      
      // Listen to deposit changes
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deposits",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log("💵 Deposit update:", payload);
          
          if (payload.new.status === "approved" && payload.old.status === "pending") {
            toast({
              title: "Deposit Approved",
              description: `Your deposit of ₹${payload.new.amount} has been approved!`,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ["deposits"] });
          queryClient.invalidateQueries({ queryKey: ["user_balance"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }
      )
      
      // Listen to withdrawal changes
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "withdrawals",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log("💸 Withdrawal update:", payload);
          
          if (payload.new.status === "approved" && payload.old.status === "pending") {
            toast({
              title: "Withdrawal Approved",
              description: `Your withdrawal of ₹${payload.new.amount} has been processed!`,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
          queryClient.invalidateQueries({ queryKey: ["user_balance"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }
      )
      
      // Listen to tournament changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournaments",
        },
        (payload) => {
          console.log("🏆 Tournament update:", payload);
          queryClient.invalidateQueries({ queryKey: ["tournaments"] });
          queryClient.invalidateQueries({ queryKey: ["user-registrations"] });
        }
      )
      
      .subscribe((status) => {
        console.log("🔌 Combined subscription status:", status);
      });

    return () => {
      console.log("🔌 Cleaning up combined subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, toast]);
};
```

### Step 2: Replace in Your Pages

#### In `src/pages/Index.tsx`:
```javascript
// BEFORE:
useRealtimeBalance(user?.id);
useRealtimeTournaments();
useRealtimeDepositsWithdrawals(user?.id);

// AFTER:
useRealtimeUpdates(user?.id);  // Just one line!
```

#### In `src/pages/Wallet.tsx`:
```javascript
// BEFORE:
useRealtimeBalance(user?.id);
useRealtimeDepositsWithdrawals(user?.id);

// AFTER:
useRealtimeUpdates(user?.id);  // Just one line!
```

### Step 3: Remove Old Hooks (Optional)

You can keep the old hooks for backward compatibility, or remove them:
- `src/hooks/useRealtimeBalance.ts`
- `src/hooks/useRealtimeDepositsWithdrawals.ts`
- `src/hooks/useRealtimeTournaments.ts`

---

## 📊 Impact Comparison

### Connection Usage:

| Users | Before (3 per user) | After (1 per user) | Status |
|-------|--------------------|--------------------|--------|
| 50    | 150 connections    | 50 connections     | ✅ Safe |
| 67    | 201 connections ❌ | 67 connections     | ✅ Safe |
| 100   | 300 connections ❌ | 100 connections    | ✅ Safe |
| 150   | 450 connections ❌ | 150 connections    | ✅ Safe |
| 200   | 600 connections ❌ | 200 connections    | ✅ At Limit |

### Benefits:

1. **3x More Users:** Support 200 users instead of 67
2. **Same Functionality:** All realtime updates still work
3. **Better Performance:** Fewer connections = less overhead
4. **Simpler Code:** One hook instead of three
5. **Cost Savings:** Stay on free tier longer

---

## ⚠️ Important Notes

### 1. **This is NOT Urgent** (But Recommended)

Your current setup will work fine until you have 67+ concurrent users online at the same time. If you have:
- **< 50 users total:** No problem yet
- **50-100 users total:** Might hit limit during peak times
- **100+ users total:** Definitely need to optimize

### 2. **Concurrent vs Total Users**

- **Total users:** All registered users (can be 1000+)
- **Concurrent users:** Users online at the same time (usually 10-30% of total)

Example:
- 200 total users
- 20-60 concurrent users (10-30%)
- 20 × 3 = 60 connections (safe)
- 60 × 3 = 180 connections (safe)

### 3. **When to Optimize**

Optimize when:
- ❌ You have 70+ total users
- ❌ You see "connection refused" errors in console
- ❌ Users report delayed updates
- ❌ Supabase dashboard shows connection limit warnings

---

## 🎯 Summary

### The Problem:
- Each user uses 3 realtime connections
- Free tier limit: 200 connections
- 67 users = 201 connections ❌ EXCEEDS LIMIT

### The Solution:
- Combine into 1 connection per user
- Same functionality, 3x more capacity
- 200 users = 200 connections ✅ SAFE

### Action Required:
1. Create `useRealtimeUpdates` hook (combines all 3)
2. Replace old hooks in pages
3. Test with multiple users
4. Deploy

### Priority:
- **Low** if you have < 50 users
- **Medium** if you have 50-100 users
- **High** if you have 100+ users

### Result:
✅ Support 200 concurrent users on free tier
✅ Same realtime functionality
✅ Better performance
✅ Simpler code

---

## 💡 Quick Check: Do You Need This Now?

Ask yourself:
1. How many total users do you have? **_____**
2. How many are online at peak times? **_____**
3. Multiply by 3: **_____ connections**

If the result is:
- **< 150:** You're fine for now, optimize later
- **150-200:** Optimize soon (within 1-2 weeks)
- **> 200:** Optimize immediately

**Most likely:** You're fine for now, but good to plan ahead! 📈
