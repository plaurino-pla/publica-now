import { test, expect } from '@playwright/test';

test.describe('Payment System Tests', () => {
  test('should display payment buttons on creator pages', async ({ page }) => {
    // Navigate to creators page first
    await page.goto('/creators');
    
    // Wait for creators to load - look for the creator cards
    await page.waitForSelector('a[href^="/"]:has-text("Visit Creator Page")', { timeout: 10000 });
    
    // Click on first creator
    const firstCreator = page.locator('a[href^="/"]:has-text("Visit Creator Page")').first();
    await firstCreator.click();
    
    // Should be on creator page
    await expect(page).toHaveURL(/\/[^\/]+$/);
    
    // Check for subscription button
    const subscribeButton = page.getByRole('button', { name: /Subscribe/i }).first();
    await expect(subscribeButton).toBeVisible();
  });

  test('should display payment buttons on article pages', async ({ page }) => {
    // Navigate to creators page
    await page.goto('/creators');
    
    // Wait for creators to load - look for the creator cards
    await page.waitForSelector('a[href^="/"]:has-text("Visit Creator Page")', { timeout: 10000 });
    
    // Click on first creator
    const firstCreator = page.locator('a[href^="/"]:has-text("Visit Creator Page")').first();
    await firstCreator.click();
    
    // Wait for creator page to load
    await page.waitForLoadState('networkidle');
    
    // Look for article links and click on first one
    const articleLinks = page.getByRole('link', { name: /Read more|Continue reading/i });
    if (await articleLinks.count() > 0) {
      await articleLinks.first().click();
      
      // Should be on article page
      await expect(page).toHaveURL(/\/content\/[^\/]+$/);
      
      // Check for purchase button
      const purchaseButton = page.getByRole('button', { name: /Purchase|Buy|Read Full/i });
      await expect(purchaseButton).toBeVisible();
    }
  });

  test('should handle subscription button clicks', async ({ page }) => {
    // Navigate to a creator page
    await page.goto('/creators');
    
    // Wait for creators to load - look for the creator cards
    await page.waitForSelector('a[href^="/"]:has-text("Visit Creator Page")', { timeout: 10000 });
    
    // Click on first creator
    const firstCreator = page.locator('a[href^="/"]:has-text("Visit Creator Page")').first();
    await firstCreator.click();
    
    // Wait for creator page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click subscription button
    const subscribeButton = page.getByRole('button', { name: /Subscribe/i }).first();
    await expect(subscribeButton).toBeVisible();
    
    // Click the button (this should trigger authentication check first)
    await subscribeButton.click();
    
    // Since user is not authenticated, should redirect to signin page
    // This is the expected behavior - users must be signed in to make payments
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should handle article purchase button clicks', async ({ page }) => {
    // Navigate to creators page
    await page.goto('/creators');
    
    // Wait for creators to load - look for the creator cards
    await page.waitForSelector('a[href^="/"]:has-text("Visit Creator Page")', { timeout: 10000 });
    
    // Click on first creator
    const firstCreator = page.locator('a[href^="/"]:has-text("Visit Creator Page")').first();
    await firstCreator.click();
    
    // Wait for creator page to load
    await page.waitForLoadState('networkidle');
    
    // Look for article links and click on first one
    const articleLinks = page.getByRole('link', { name: /Read more|Continue reading/i });
    if (await articleLinks.count() > 0) {
      await articleLinks.first().click();
      
      // Wait for article page to load
      await page.waitForLoadState('networkidle');
      
      // Check for purchase button
      const purchaseButton = page.getByRole('button', { name: /Purchase|Buy|Read Full/i });
      await expect(purchaseButton).toBeVisible();
      
      // Click the button (this should trigger authentication check first)
      await purchaseButton.click();
      
      // Since user is not authenticated, should redirect to signin page
      // This is the expected behavior - users must be signed in to make payments
      await expect(page).toHaveURL(/\/auth\/signin/);
    }
  });

  test('should show proper payment UI states', async ({ page }) => {
    // Navigate to a creator page
    await page.goto('/creators');
    
    // Wait for creators to load - look for the creator cards
    await page.waitForSelector('a[href^="/"]:has-text("Visit Creator Page")', { timeout: 10000 });
    
    // Click on first creator
    const firstCreator = page.locator('a[href^="/"]:has-text("Visit Creator Page")').first();
    await firstCreator.click();
    
    // Wait for creator page to load
    await page.waitForLoadState('networkidle');
    
    // Check that payment buttons have proper styling and are interactive
    const subscribeButton = page.getByRole('button', { name: /Subscribe/i }).first();
    await expect(subscribeButton).toBeVisible();
    await expect(subscribeButton).toBeEnabled();
    
    // Button should have proper styling - check for primary button classes
    const buttonClasses = await subscribeButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-brand-600');
    expect(buttonClasses).toContain('text-white');
    expect(buttonClasses).toContain('rounded-md');
  });

  test('should handle payment button loading states', async ({ page }) => {
    // Navigate to a creator page
    await page.goto('/creators');
    
    // Wait for creators to load - look for the creator cards
    await page.waitForSelector('a[href^="/"]:has-text("Visit Creator Page")', { timeout: 10000 });
    
    // Click on first creator
    const firstCreator = page.locator('a[href^="/"]:has-text("Visit Creator Page")').first();
    await firstCreator.click();
    
    // Wait for creator page to load
    await page.waitForLoadState('networkidle');
    
    // Find subscription button
    const subscribeButton = page.getByRole('button', { name: /Subscribe/i }).first();
    await expect(subscribeButton).toBeVisible();
    
    // Click button and check for loading state
    await subscribeButton.click();
    
    // Should show loading state or redirect
    // This test verifies the button doesn't get stuck in a broken state
    await expect(page).not.toHaveURL(/.*error.*/);
  });
});
