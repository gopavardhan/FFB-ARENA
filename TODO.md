# Real-Time Balance Update Fix - TODO

## Tasks to Complete

- [x] 1. Update QueryClient configuration in App.tsx
  - [x] Add default query options for real-time behavior
  - [x] Configure refetchOnWindowFocus, refetchOnMount, staleTime

- [x] 2. Enhance useUserBalance hook in useWallet.ts
  - [x] Add refetchInterval for periodic balance checks (5 seconds)
  - [x] Set appropriate staleTime (0 for immediate updates)
  - [x] Enable refetchOnWindowFocus and refetchOnMount
  - [x] Add refetchOnReconnect
  - [x] Add refetchIntervalInBackground

- [x] 3. Improve useRealtimeBalance hook
  - [x] Add aggressive cache invalidation with refetch
  - [x] Improve error handling
  - [x] Add retry logic for failed subscriptions

## Progress
- Started: ✓
- Completed: ✓

## Summary of Changes

### 1. App.tsx
- Added QueryClient configuration with default options
- Enabled refetchOnWindowFocus, refetchOnMount, refetchOnReconnect
- Set staleTime to 0 for real-time updates
- Added retry logic with exponential backoff

### 2. useWallet.ts (useUserBalance hook)
- Added refetchInterval: 5000ms (polls every 5 seconds)
- Added refetchIntervalInBackground: true (continues polling in background)
- Enabled all refetch options for maximum responsiveness
- Set staleTime: 0 to always fetch fresh data
- Added enabled: !!userId to prevent unnecessary queries

### 3. useRealtimeBalance.ts
- Made callback async for proper await handling
- Added immediate refetch after invalidation
- Improved subscription status handling
- Added automatic resubscription on channel errors
- Enhanced logging for debugging

## How It Works Now

1. **Polling**: Balance is automatically refetched every 5 seconds
2. **Real-time Subscriptions**: Supabase real-time updates trigger immediate refetch
3. **User Actions**: Balance refetches when user focuses window, mounts component, or reconnects
4. **Error Recovery**: Automatic resubscription if real-time connection fails

This ensures the balance is always up-to-date across all pages (Wallet, Dashboard, Header).
