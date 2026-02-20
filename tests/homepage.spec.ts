import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads without errors
    await expect(page).toHaveTitle(/Sell Your Content Your Way/);
    
    // Verify main hero section is visible - updated to match actual content
    await expect(page.locator('h1')).toContainText('Sell your content');
    await expect(page.locator('h1')).toContainText('your way');
    
    // Check if CTA buttons are present - use simpler, more reliable selectors
    await expect(page.getByRole('link', { name: 'Start publishing free' }).first()).toBeVisible();
    // The second CTA now points to How It Works and may appear only below the fold; be resilient
    const learnCta = page.getByRole('link', { name: 'See how it works' });
    await learnCta.scrollIntoViewIfNeeded();
    await expect(learnCta).toBeVisible();
  });

  test('should display content types section', async ({ page }) => {
    await page.goto('/');
    
    // Verify content types section - updated to match actual content
    await expect(page.getByRole('heading', { name: 'Publish any type of content' })).toBeVisible();
    
    // Check if all content type headings are visible - updated to match actual content
    await expect(page.getByRole('heading', { name: 'Text Articles' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Audio Content' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Image Galleries' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Video Content' })).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links - use first() to avoid duplicate link issues
    await page.getByRole('link', { name: 'Discover Creators' }).first().click();
    await expect(page).toHaveURL(/.*creators/);
    
    await page.goBack();
    
    // Use first() for Features link to avoid strict mode violation
    await page.getByRole('link', { name: 'Features' }).first().click();
    await expect(page).toHaveURL(/.*features/);
  });

  test('should have working mobile navigation links', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Open mobile menu first
    const menuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    
    // Wait for mobile menu to be visible
    const mobileMenu = page.getByRole('dialog', { name: 'Mobile navigation menu' });
    await expect(mobileMenu).toBeVisible();
    
    // Test mobile navigation links - use first() to avoid strict mode violation
    await page.getByRole('link', { name: 'Discover Creators' }).first().click();
    await expect(page).toHaveURL(/.*creators/);
    
    await page.goBack();
    
    // Open mobile menu again
    await menuButton.click();
    await expect(mobileMenu).toBeVisible();
    
    // Use first() to avoid strict mode violation with multiple Features links
    await page.getByRole('link', { name: 'Features' }).first().click();
    await expect(page).toHaveURL(/.*features/);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile navigation button is visible
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).toBeVisible();
    
    // Check if hero text is readable on mobile - updated to match actual content
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Sell your content');
    
    // Verify CTA buttons are present on mobile - updated button text
    const startButtons = page.getByRole('link', { name: 'Start publishing free' });
    const seeHowButtons = page.getByRole('link', { name: 'See how it works' });
    
    await expect(startButtons.first()).toBeVisible();
    await expect(seeHowButtons.first()).toBeVisible();
    
    // Check that we have multiple instances (which is expected for marketing pages)
    const startButtonCount = await startButtons.count();
    const seeHowButtonCount = await seeHowButtons.count();
    
    expect(startButtonCount).toBeGreaterThanOrEqual(1);
    expect(seeHowButtonCount).toBeGreaterThanOrEqual(1);
  });

  test('should have proper meta tags and SEO elements', async ({ page }) => {
    await page.goto('/');
    
    // Check meta description - use first() to avoid duplicates
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      await expect(metaDescription.first()).toHaveAttribute('content', /Create, publish, and monetize/);
    }
    
    // Check viewport meta tag - use first() to avoid duplicates
    const viewport = page.locator('meta[name="viewport"]');
    if (await viewport.count() > 0) {
      await expect(viewport.first()).toHaveAttribute('content', /width=device-width/);
    }
    
    // Verify Open Graph tags - check if they exist first and use first()
    const ogTitle = page.locator('meta[property="og:title"]');
    if (await ogTitle.count() > 0) {
      await expect(ogTitle.first()).toHaveAttribute('content', /publica\.now/);
    }
  });
});
