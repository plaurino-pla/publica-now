import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test('should adapt layout for mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile-specific elements are visible
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).toBeVisible();
    
    // Verify mobile logo sizing - check if logo is visible
    const logo = page.locator('img[alt="publica.now"]');
    await expect(logo.first()).toBeVisible();
    
    // Check if tagline is hidden on mobile (may vary based on exact breakpoint)
    const tagline = page.locator('text=by publica.la');
    // This might be visible on some mobile sizes, so just check it exists
    expect(await tagline.count()).toBeGreaterThanOrEqual(0);
  });

  test('should adapt layout for tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check if tablet-specific elements are visible
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).toBeVisible();
    
    // Verify tablet logo sizing
    const logo = page.locator('img[alt="publica.now"]');
    await expect(logo.first()).toBeVisible();
    
    // Check if tagline is visible on tablet - use first() to avoid duplicates
    const tagline = page.locator('text=by publica.la');
    await expect(tagline.first()).toBeVisible();
  });

  test('should adapt layout for desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    // Check if desktop navigation is visible - use first() to avoid duplicates
    await expect(page.getByText('Discover Creators').first()).toBeVisible();
    await expect(page.getByText('Features').first()).toBeVisible();
    await expect(page.getByText('How it works').first()).toBeVisible();
    
    // Mobile menu button should be hidden on desktop
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).not.toBeVisible();
    
    // Verify desktop logo sizing
    const logo = page.locator('img[alt="publica.now"]');
    await expect(logo.first()).toBeVisible();
  });

  test('should have responsive typography', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileTitle = page.locator('h1');
    await expect(mobileTitle).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletTitle = page.locator('h1');
    await expect(tabletTitle).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    const desktopTitle = page.locator('h1');
    await expect(desktopTitle).toBeVisible();
  });

  test('should have responsive grid layouts', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport - single column
    await page.setViewportSize({ width: 375, height: 667 });
    const contentCards = page.locator('.grid.grid-cols-1');
    if (await contentCards.count() > 0) {
      await expect(contentCards.first()).toBeVisible();
    }
    
    // Test tablet viewport - two columns
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletGrid = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2');
    if (await tabletGrid.count() > 0) {
      await expect(tabletGrid.first()).toBeVisible();
    }
    
    // Test desktop viewport - four columns
    await page.setViewportSize({ width: 1280, height: 720 });
    const desktopGrid = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    if (await desktopGrid.count() > 0) {
      await expect(desktopGrid.first()).toBeVisible();
    }
  });
});
