import { test, expect } from '@playwright/test';

test.describe('Performance and Loading Tests', () => {
  test('should load homepage within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Allow up to 10 seconds for loading
    expect(loadTime).toBeLessThan(10000);
    
    // Verify page loaded correctly
    await expect(page).toHaveTitle(/Sell Your Content Your Way/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have working images and assets', async ({ page }) => {
    await page.goto('/');
    
    // Check if logo image loads - use first() to avoid duplicates
    const logo = page.locator('img[alt="publica.now"]');
    await expect(logo.first()).toBeVisible();
    
    // Check if logo has src attribute
    await expect(logo.first()).toHaveAttribute('src');
    
    // Verify logo loads without errors
    const logoSrc = await logo.first().getAttribute('src');
    expect(logoSrc).toBeTruthy();
    
    // Check if logo has proper dimensions
    const logoBox = await logo.first().boundingBox();
    if (logoBox) {
      expect(logoBox.width).toBeGreaterThan(0);
      expect(logoBox.height).toBeGreaterThan(0);
    }
  });

  test('should handle form interactions properly', async ({ page }) => {
    await page.goto('/');
    
    // Check if CTA button is visible and clickable
    const startButton = page.getByRole('link', { name: 'Start Publishing Free' }).first();
    await expect(startButton).toBeVisible();
    
    // Hover over button
    await startButton.hover();
    await expect(startButton).toBeVisible();
    
    // Click button
    await startButton.click();
    
    // Should navigate to signup page
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to creators page
    await page.getByRole('link', { name: 'Discover Creators' }).first().click();
    await expect(page).toHaveURL(/.*creators/);
    
    // Go back to homepage
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Verify homepage elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Publishing Free' }).first()).toBeVisible();
  });

  test('should work across different browsers and viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Discover Creators')).toBeVisible();
  });

  test('collects basic Web Vitals on homepage', async ({ page }, testInfo) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        const perf: any = { entries: [] };
        try {
          new PerformanceObserver((list) => {
            list.getEntries().forEach(e => perf.entries.push({ name: e.name, startTime: e.startTime, duration: e.duration, entryType: e.entryType }));
          }).observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
        } catch {}
        setTimeout(() => resolve(perf), 1500);
      });
    });

    // Store metrics to artifacts for CI
    const fs = require('fs');
    const path = require('path');
    const outDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'performance-metrics.json'), JSON.stringify(metrics, null, 2));

    // Basic assertions
    await expect(page).toHaveTitle(/Sell Your Content Your Way/);
  });
});
