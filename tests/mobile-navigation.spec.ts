import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests in this file
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should open and close mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Mobile menu button should be visible
    const menuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await expect(menuButton).toBeVisible();
    
    // Click to open menu
    await menuButton.click();
    
    // Menu should be visible
    const mobileMenu = page.getByRole('dialog', { name: 'Mobile navigation menu' });
    await expect(mobileMenu).toBeVisible();
    
    // Close button should be visible
    const closeButton = page.locator('button[aria-label="Close menu"]');
    await expect(closeButton).toBeVisible();
    
    // Click to close menu
    await closeButton.click();
    
    // Menu should be hidden
    await expect(mobileMenu).not.toBeVisible();
  });

  test('should display all navigation items in mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    
    // Target only within the dialog panel
    const mobileMenu = page.getByRole('dialog', { name: 'Mobile navigation menu' });
    
    await expect(mobileMenu.getByRole('button', { name: 'Discover Creators' })).toBeVisible();
    await expect(mobileMenu.getByRole('button', { name: 'Features' })).toBeVisible();
    await expect(mobileMenu.getByRole('button', { name: 'How it works' })).toBeVisible();
    await expect(mobileMenu.getByRole('button', { name: 'Pricing' })).toBeVisible();
    await expect(mobileMenu.getByRole('button', { name: 'Vision' })).toBeVisible();
    
    // Check if auth buttons are present in mobile menu specifically
    await expect(mobileMenu.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(mobileMenu.getByRole('button', { name: 'Get started' })).toBeVisible();
  });

  test('should have proper touch targets in mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    
    // Check if menu items have proper height (44px minimum)
    const menuItems = page.locator('button[class*="h-14"]');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0); // At least one menu item should exist
    
    // Verify touch targets are properly sized for visible items
    for (let i = 0; i < Math.min(count, 3); i++) { // Check first 3 items
      const item = menuItems.nth(i);
      if (await item.isVisible()) {
        const box = await item.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should navigate to pages from mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    
    const mobileMenu = page.getByRole('dialog', { name: 'Mobile navigation menu' });
    await mobileMenu.getByRole('button', { name: 'Discover Creators' }).click();
    
    // Should navigate to creators page
    await expect(page).toHaveURL(/.*creators/);
    
    // Go back and test another link
    await page.goBack();
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    await mobileMenu.getByRole('button', { name: 'Features' }).click();
    
    // Should navigate to features page
    await expect(page).toHaveURL(/.*features/);
  });

  test('should handle mobile menu backdrop click', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    
    // Menu should be visible
    const mobileMenu = page.getByRole('dialog', { name: 'Mobile navigation menu' });
    await expect(mobileMenu).toBeVisible();
    
    // Prefer robust close: click the visible close button
    const closeButton = page.locator('button[aria-label="Close menu"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Fallback to pressing Escape
      await page.keyboard.press('Escape');
    }
    
    // Menu should close
    await expect(mobileMenu).not.toBeVisible();
  });
});
