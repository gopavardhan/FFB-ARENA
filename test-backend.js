/**
 * Backend Verification Script
 * Tests if all database tables, functions, and data are working correctly
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://xukowavzxgnjukalxjjv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1a293YXZ6eGduanVrYWx4amp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1Nzg5OTQsImV4cCI6MjA3NTE1NDk5NH0.Fp7HRA0F8cPud8h5aUkF8EZyG7-UP_rJQaOpQq7qQps';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// Test 1: Check if player_statistics table exists
async function testPlayerStatisticsTable() {
  try {
    const { data, error } = await supabase
      .from('player_statistics')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    logTest('player_statistics table exists', true, `Found ${data ? data.length : 0} records`);
    return true;
  } catch (error) {
    logTest('player_statistics table exists', false, error.message);
    return false;
  }
}

// Test 2: Check if achievements table exists and has 15 achievements
async function testAchievementsTable() {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*');
    
    if (error) throw error;
    
    const count = data ? data.length : 0;
    const passed = count === 15;
    logTest('achievements table has 15 achievements', passed, `Found ${count} achievements`);
    return passed;
  } catch (error) {
    logTest('achievements table exists', false, error.message);
    return false;
  }
}

// Test 3: Check if user_achievements table exists
async function testUserAchievementsTable() {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    logTest('user_achievements table exists', true, `Found ${data ? data.length : 0} records`);
    return true;
  } catch (error) {
    logTest('user_achievements table exists', false, error.message);
    return false;
  }
}

// Test 4: Check if tournament_brackets table exists
async function testTournamentBracketsTable() {
  try {
    const { data, error } = await supabase
      .from('tournament_brackets')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    logTest('tournament_brackets table exists', true, `Found ${data ? data.length : 0} records`);
    return true;
  } catch (error) {
    logTest('tournament_brackets table exists', false, error.message);
    return false;
  }
}

// Test 5: Check if teams table exists
async function testTeamsTable() {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    logTest('teams table exists', true, `Found ${data ? data.length : 0} records`);
    return true;
  } catch (error) {
    logTest('teams table exists', false, error.message);
    return false;
  }
}

// Test 6: Check if team_members table exists
async function testTeamMembersTable() {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    logTest('team_members table exists', true, `Found ${data ? data.length : 0} records`);
    return true;
  } catch (error) {
    logTest('team_members table exists', false, error.message);
    return false;
  }
}

// Test 7: Check achievement categories
async function testAchievementCategories() {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('category');
    
    if (error) throw error;
    
    const categories = [...new Set(data.map(a => a.category))];
    const expectedCategories = ['tournament', 'earnings', 'social', 'special'];
    const hasAllCategories = expectedCategories.every(cat => categories.includes(cat));
    
    logTest('achievements have all categories', hasAllCategories, 
      `Found categories: ${categories.join(', ')}`);
    return hasAllCategories;
  } catch (error) {
    logTest('achievements have all categories', false, error.message);
    return false;
  }
}

// Test 8: Check achievement rarities
async function testAchievementRarities() {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('rarity');
    
    if (error) throw error;
    
    const rarities = [...new Set(data.map(a => a.rarity))];
    const expectedRarities = ['common', 'rare', 'epic', 'legendary'];
    const hasAllRarities = expectedRarities.every(rar => rarities.includes(rar));
    
    logTest('achievements have all rarities', hasAllRarities, 
      `Found rarities: ${rarities.join(', ')}`);
    return hasAllRarities;
  } catch (error) {
    logTest('achievements have all rarities', false, error.message);
    return false;
  }
}

// Test 9: Check if all achievements are active
async function testAchievementsActive() {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('is_active');
    
    if (error) throw error;
    
    const allActive = data.every(a => a.is_active === true);
    logTest('all achievements are active', allActive, 
      `${data.filter(a => a.is_active).length}/${data.length} active`);
    return allActive;
  } catch (error) {
    logTest('all achievements are active', false, error.message);
    return false;
  }
}

// Test 10: Check database connection
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    logTest('database connection', true, 'Successfully connected to Supabase');
    return true;
  } catch (error) {
    logTest('database connection', false, error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n🔍 Starting Backend Verification Tests...\n');
  console.log('━'.repeat(60));
  console.log('\n📊 Testing Database Tables:\n');
  
  await testDatabaseConnection();
  await testPlayerStatisticsTable();
  await testAchievementsTable();
  await testUserAchievementsTable();
  await testTournamentBracketsTable();
  await testTeamsTable();
  await testTeamMembersTable();
  
  console.log('\n📋 Testing Data Integrity:\n');
  
  await testAchievementCategories();
  await testAchievementRarities();
  await testAchievementsActive();
  
  console.log('\n' + '━'.repeat(60));
  console.log('\n📈 Test Results:\n');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total:  ${results.passed + results.failed}`);
  
  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Backend is fully functional!\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.\n');
    console.log('Failed tests:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`  - ${t.name}: ${t.message}`));
    console.log('');
  }
  
  console.log('━'.repeat(60));
  console.log('\n📚 For detailed verification steps, see: BACKEND_VERIFICATION_GUIDE.md\n');
}

// Run tests
runTests().catch(console.error);
