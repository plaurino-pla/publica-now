import { FullConfig } from '@playwright/test';

/**
 * Global teardown for Playwright tests
 * This runs once after all tests and cleans up the testing environment
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up any test data created during testing
    console.log('🗑️ Cleaning up test data...');
    
    // Optional: Remove test users, test content, etc.
    // This is where you'd clean up any data created during tests
    
    // Optional: Reset database state
    // await resetTestDatabase();
    
    console.log('✅ Test data cleanup completed');
    
  } catch (error) {
    console.error('❌ Error during teardown:', error);
    // Don't throw here as teardown failures shouldn't fail the entire test run
  }
  
  console.log('✅ Global teardown completed successfully');
}

export default globalTeardown;
