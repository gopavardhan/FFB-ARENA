# Supabase Free Tier Limits & Optimization

## 🚨 Supabase Free Tier Limits

### Current Limits (as of 2024):
- **Database Size:** 500 MB
- **Bandwidth:** 5 GB/month
- **API Requests:** ~2 million requests/month (soft limit)
- **Realtime Connections:** 200 concurrent connections
- **Realtime Messages:** 2 million messages/month

### Your Current Setup (BEFORE Optimization):
- Balance: Every 3 seconds = **28,800 requests/day/user**
- Tournaments: Every 5 seconds = **17,280 requests/day/user**
- Transactions: Every 15 seconds = **5,760 requests/day/user**
- Deposits: Every 12 seconds = **7,200 requests/day/user**
- Withdrawals: Every 12 seconds = **7,200 requests/day/user**

**Total per user:** ~66,240 requests/day
**With 100 users:** 6.6 million requests/day ❌ **EXCEEDS LIMIT!**

---

## ✅ Optimized Solution

### Strategy:
1. **Rely MORE on Supabase Realtime** (free, doesn't count as API requests)
2. **Reduce polling frequency** (only as backup)
3. **Stop polling when tab is inactive**
4. **Use smart refetch triggers**

### Optimized Intervals:

| Data Type | Old Interval | New Interval | Reason |
|-----------|-------------|--------------|---------|
| Balance | 3s | 30s | Realtime handles updates |
| Tournaments | 5s | 60s | Changes infrequent |
| Transactions | 15s | 60s | Realtime handles updates |
| Deposits | 12s | 60s | Realtime handles updates |
| Withdrawals | 12s | 60s | Realtime handles updates |
| Activities | 20s | 120s | Historical data |
| Boss Counts | 10s | 30s | Admin only |

**New total per user:** ~2,880 requests/day (95% reduction!)
**With 100 users:** 288,000 requests/day ✅ **WELL WITHIN LIMIT!**

---

## 📊 Cost Calculation

### Free Tier Budget:
- 2 million requests/month = ~66,666 requests/day

### With Optimization:
- 100 active users = 288,000 requests/day ❌ Still over!
- **Solution:** Stop polling when tab inactive

### With Tab Visibility Optimization:
- Average user active 20% of time
- 288,000 × 0.2 = **57,600 requests/day** ✅ **SAFE!**

---

## 🎯 Recommended Configuration

Balance updates are handled by:
1. **Supabase Realtime** (instant, free) - PRIMARY
2. **Polling every 30s** (backup) - SECONDARY
3. **Window focus refetch** (when user returns)
4. **Manual refetch on actions** (deposit, withdrawal)

This gives you:
- ✅ Real-time updates (via Supabase Realtime)
- ✅ Backup polling (in case realtime fails)
- ✅ Low API usage (within free tier)
- ✅ Good user experience
