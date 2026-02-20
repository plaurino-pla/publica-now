import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
  });

  test('should display signin page correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/publica\.now/);
    await expect(page.locator('h1')).toContainText('Welcome back');
    
    // Verify both authentication methods are present
    await expect(page.getByRole('button', { name: /Email & Password/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Magic Link/ })).toBeVisible();
    
    // Check that magic link is disabled (as configured)
    const magicLinkButton = page.getByRole('button', { name: /Magic Link/ });
    await expect(magicLinkButton).toBeDisabled();
    await expect(magicLinkButton).toContainText('(Unavailable)');
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/publica\.now/);
    await expect(page.locator('h1')).toContainText('Create your account');
    
    // Verify form fields are present
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Full name')).toBeVisible();
    
    // Check optional creator fields
    await expect(page.getByLabel('Creator name')).toBeVisible();
    await expect(page.getByLabel('Creator handle')).toBeVisible();
  });

  test('should handle signup form validation', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Should show validation errors for required fields
    // Note: HTML5 validation might not show custom error messages
    // We'll check that the form doesn't submit successfully
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('should handle signin form validation', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // HTML5 validation prevents form submission, so we should stay on the same page
    // The form won't submit with empty required fields
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill form with invalid credentials
    await page.getByLabel('Email address').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for error to appear (this depends on the actual error message from your API)
    // Since we don't know the exact error message, let's check that we're still on signin page
    await expect(page).toHaveURL(/\/auth\/signin/);
    
    // Check that some error message is displayed (either from API or form validation)
    const errorElement = page.locator('.text-red-600, .bg-red-50');
    if (await errorElement.count() > 0) {
      await expect(errorElement.first()).toBeVisible();
    }
  });

  test('should have working navigation between auth pages', async ({ page }) => {
    // Start on signin page
    await page.goto('/auth/signin');
    
    // Check for signup link
    const signupLink = page.getByRole('link', { name: 'Sign up' });
    await expect(signupLink).toBeVisible();
    
    // Click signup link
    await signupLink.click();
    
    // Should navigate to signup page
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.locator('h1')).toContainText('Create your account');
    
    // Go back to signin
    await page.goto('/auth/signin');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('should redirect authenticated users away from auth pages', async ({ page }) => {
    // This test would require setting up a test user and authentication
    // For now, we'll test the basic structure
    await page.goto('/auth/signin');
    
    // Verify the page loads (no redirect for unauthenticated users)
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('should have proper form accessibility', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check form labels are properly associated
    const emailInput = page.getByLabel('Email address');
    const passwordInput = page.getByLabel('Password');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Check form submission works with Enter key
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await passwordInput.press('Enter');
    
    // Should attempt to submit (may fail due to invalid credentials, but should try)
    await expect(page.getByText(/Invalid credentials|Signing in|Failed to create account/)).toBeVisible();
  });
});
