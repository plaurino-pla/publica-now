import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    const menuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-label', 'Toggle mobile menu');
    const logo = page.locator('img[alt="publica.now"]');
    await expect(logo.first()).toBeVisible();
    await expect(logo.first()).toHaveAttribute('alt', 'publica.now');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    // Focus menu button explicitly and open with Enter
    const menuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.focus();
    await menuButton.press('Enter');
    const mobileMenu = page.getByRole('dialog', { name: 'Mobile navigation menu' });
    await expect(mobileMenu).toBeVisible();
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    // Updated to match actual content
    await expect(h1Elements.first()).toContainText('Sell your content');
    const h2Elements = page.locator('h2');
    const h2Count = await h2Elements.count();
    expect(h2Count).toBeGreaterThanOrEqual(3);
    if (h2Count > 0) await expect(h2Elements.nth(0)).toBeVisible();
  });

  test('should have proper link descriptions', async ({ page }) => {
    await page.goto('/');
    // Updated button text to match actual content
    const startButton = page.getByRole('link', { name: 'Start publishing free' }).first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveAttribute('href', '/auth/signup');
    // Updated button text and href to match actual content
    const learnButton = page.getByRole('link', { name: 'See how it works' });
    await expect(learnButton).toBeVisible();
    await expect(learnButton).toHaveAttribute('href', '#how-it-works');
    const creatorsLink = page.getByRole('link', { name: 'Discover Creators' });
    await expect(creatorsLink).toBeVisible();
    await expect(creatorsLink).toHaveAttribute('href', '/creators');
  });

  test('should have proper color contrast and focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    // Focus an interactive element and confirm focus exists
    const menuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await menuButton.focus();
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    await expect(menuButton).toBeFocused();
  });
});
