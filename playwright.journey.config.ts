import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration optimized for User Journey Testing
 * This configuration focuses on realistic user workflows and end-to-end testing
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests sequentially for journey testing to avoid conflicts */
  fullyParallel: false,
  workers: 1,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  
  /* Reporter optimized for journey testing */
  reporter: [
    ['html', { outputFolder: 'test-results/journey' }],
    ['json', { outputFile: 'test-results/journey/results.json' }],
    ['junit', { outputFile: 'test-results/journey/results.xml' }],
    ['list'] // Console output for journey progress
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace for journey debugging */
    trace: 'on',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video for journey analysis */
    video: 'on-first-retry',
    
    /* Global test timeout for journey tests */
    actionTimeout: 15000,
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
    /* Desktop journey testing - primary */
    {
      name: 'journey-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // Optimize for journey testing
        launchOptions: {
          args: [
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-web-security', // Allow cross-origin requests for testing
            '--disable-features=VizDisplayCompositor',
          ]
        }
      },
    },

    /* Mobile journey testing */
    {
      name: 'journey-mobile',
      use: { 
        ...devices['Pixel 5'],
        // Mobile-specific optimizations for journey testing
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    /* Fast journey testing for development */
    {
      name: 'journey-fast',
      use: { 
        ...devices['Desktop Chrome'],
        // Minimal configuration for fast journey feedback
        launchOptions: {
          args: ['--disable-gpu', '--disable-software-rasterizer', '--disable-web-security']
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

  /* Global test timeout for journey tests */
  globalTimeout: 900000, // 15 minutes for complete journeys
  
  /* Test timeout for individual journey steps */
  timeout: 60000, // 1 minute per test
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 15000, // 15 seconds for assertions
  },

  /* Output directory for journey test artifacts */
  outputDir: 'test-results/journey/',
  
  /* Global setup and teardown for journey testing */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
  
  /* Test matching for journey tests */
  grep: /User Journey|Complete Creator|Reader Journey|Authentication Flow|Account Management/,
});
