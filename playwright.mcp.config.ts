import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration optimized for MCP (Model Context Protocol) testing
 * This configuration focuses on fast, reliable tests for AI-assisted development
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests in parallel for faster execution */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter optimized for MCP */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global test timeout */
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    /* Viewport size for consistent testing */
    viewport: { width: 1280, height: 720 },
    
    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,
    
    /* Extra HTTP headers for testing */
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
  },

  /* Configure projects for different testing scenarios */
  projects: [
    /* Desktop browsers - primary testing */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Optimize for MCP testing
        launchOptions: {
          args: [
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
          ]
        }
      },
    },

    /* Mobile testing */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile-specific optimizations
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    /* Fast testing for development */
    {
      name: 'fast',
      use: { 
        ...devices['Desktop Chrome'],
        // Minimal configuration for fast feedback
        launchOptions: {
          args: ['--disable-gpu', '--disable-software-rasterizer']
        }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  /* Global test timeout */
  globalTimeout: 600000, // 10 minutes
  
  /* Test timeout */
  timeout: 30000, // 30 seconds per test
  
  /* Expect timeout */
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  /* Output directory for test artifacts */
  outputDir: 'test-results/',
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
});
