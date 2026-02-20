import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * This runs once before all tests and sets up the testing environment
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  console.log('🚀 Starting global setup...');
  console.log(`📍 Base URL: ${baseURL}`);
  
  // Launch browser to check if the application is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test if the application is running
    console.log('🔍 Checking if application is accessible...');
    await page.goto(baseURL as string);
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if the page loaded successfully
    const title = await page.title();
    console.log(`✅ Application is accessible. Page title: ${title}`);
    
    // Optional: Set up test data or authentication tokens here
    // For example, create a test user account
    
  } catch (error) {
    console.error('❌ Application is not accessible:', error);
    throw new Error(`Application setup failed: ${error}`);
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed successfully');
}

export default globalSetup;
