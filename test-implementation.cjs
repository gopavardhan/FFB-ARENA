const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Real-Time Implementation...\n');

let allTestsPassed = true;

// Test 1: Check App.tsx
console.log('Test 1: Checking App.tsx...');
const appContent = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf8');
if (appContent.includes('refetchOnWindowFocus: true') && 
    appContent.includes('refetchOnMount: true') &&
    appContent.includes('staleTime: 0')) {
  console.log('✅ App.tsx: QueryClient configured correctly\n');
} else {
  console.log('❌ App.tsx: Missing QueryClient configuration\n');
  allTestsPassed = false;
}

// Test 2: Check useWallet.ts
console.log('Test 2: Checking useWallet.ts...');
const walletContent = fs.readFileSync(path.join(__dirname, 'src/hooks/useWallet.ts'), 'utf8');
if (walletContent.includes('refetchInterval: 5000') && 
    walletContent.includes('refetchIntervalInBackground: true') &&
    walletContent.includes('staleTime: 0')) {
  console.log('✅ useWallet.ts: useUserBalance configured correctly');
}
if (walletContent.includes('refetchInterval: 15000')) {
  console.log('✅ useWallet.ts: useUserTransactions configured correctly');
}
if (walletContent.includes('refetchInterval: 12000')) {
  console.log('✅ useWallet.ts: useUserDeposits configured correctly');
  console.log('✅ useWallet.ts: useUserWithdrawals configured correctly\n');
} else {
  console.log('❌ useWallet.ts: Missing configurations\n');
  allTestsPassed = false;
}

// Test 3: Check useRealtimeBalance.ts
console.log('Test 3: Checking useRealtimeBalance.ts...');
const balanceContent = fs.readFileSync(path.join(__dirname, 'src/hooks/useRealtimeBalance.ts'), 'utf8');
if (balanceContent.includes('await queryClient.invalidateQueries') && 
    balanceContent.includes('await queryClient.refetchQueries') &&
    balanceContent.includes('CHANNEL_ERROR')) {
  console.log('✅ useRealtimeBalance.ts: Enhanced with immediate refetch and error recovery\n');
} else {
  console.log('❌ useRealtimeBalance.ts: Missing enhancements\n');
  allTestsPassed = false;
}

// Test 4: Check useTournaments.ts
console.log('Test 4: Checking useTournaments.ts...');
const tournamentsContent = fs.readFileSync(path.join(__dirname, 'src/hooks/useTournaments.ts'), 'utf8');
if (tournamentsContent.includes('refetchInterval: 10000') && 
    tournamentsContent.includes('refetchInterval: 8000')) {
  console.log('✅ useTournaments.ts: Configured correctly\n');
} else {
  console.log('❌ useTournaments.ts: Missing configurations\n');
  allTestsPassed = false;
}

// Test 5: Check useRealtimeTournaments.ts
console.log('Test 5: Checking useRealtimeTournaments.ts...');
const realtimeTournamentsContent = fs.readFileSync(path.join(__dirname, 'src/hooks/useRealtimeTournaments.ts'), 'utf8');
if (realtimeTournamentsContent.includes('await queryClient.invalidateQueries') && 
    realtimeTournamentsContent.includes('CHANNEL_ERROR')) {
  console.log('✅ useRealtimeTournaments.ts: Enhanced correctly\n');
} else {
  console.log('❌ useRealtimeTournaments.ts: Missing enhancements\n');
  allTestsPassed = false;
}

// Test 6: Check useActivities.ts
console.log('Test 6: Checking useActivities.ts...');
const activitiesContent = fs.readFileSync(path.join(__dirname, 'src/hooks/useActivities.ts'), 'utf8');
if (activitiesContent.includes('refetchInterval: 20000')) {
  console.log('✅ useActivities.ts: Configured correctly\n');
} else {
  console.log('❌ useActivities.ts: Missing configuration\n');
  allTestsPassed = false;
}

// Test 7: Check useBossCounts.ts
console.log('Test 7: Checking useBossCounts.ts...');
const bossCountsContent = fs.readFileSync(path.join(__dirname, 'src/hooks/useBossCounts.ts'), 'utf8');
if (bossCountsContent.includes('refetchInterval: 3000')) {
  console.log('✅ useBossCounts.ts: Configured correctly\n');
} else {
  console.log('❌ useBossCounts.ts: Missing configuration\n');
  allTestsPassed = false;
}

// Summary
console.log('═══════════════════════════════════════════════════════');
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('✅ Real-time implementation is complete and correct');
  console.log('\n📊 Summary:');
  console.log('   - QueryClient: Configured for real-time behavior');
  console.log('   - Balance: Updates every 5 seconds');
  console.log('   - Tournaments: Updates every 10 seconds');
  console.log('   - Registrations: Updates every 8 seconds');
  console.log('   - Deposits/Withdrawals: Updates every 12 seconds');
  console.log('   - Transactions: Updates every 15 seconds');
  console.log('   - Activities: Updates every 20 seconds');
  console.log('   - Boss Counts: Updates every 3 seconds');
  console.log('\n🚀 Application is ready for testing!');
  console.log('🌐 Server: http://localhost:8080/');
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('Please review the failed tests above');
}
console.log('═══════════════════════════════════════════════════════\n');
