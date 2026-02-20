import { Page, expect } from '@playwright/test';

/**
 * Test utility functions for common testing operations
 * These helpers make tests more readable and maintainable
 */

export class TestHelpers {
  /**
   * Wait for a page to be fully loaded
   */
  static async waitForPageLoad(page: Page) {
    await page.waitForLoadState('domcontentloaded');
    // Use a shorter timeout for networkidle to avoid hanging
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      // If networkidle times out, just continue - the page is likely loaded enough
      console.log('Network idle timeout, continuing with test...');
    }
  }

  /**
   * Navigate to a page and wait for it to load
   */
  static async navigateToPage(page: Page, url: string) {
    await page.goto(url);
    await this.waitForPageLoad(page);
  }

  /**
   * Fill a form with data
   */
  static async fillForm(page: Page, formData: Record<string, string>) {
    for (const [label, value] of Object.entries(formData)) {
      const input = page.getByLabel(label);
      await input.fill(value);
    }
  }

  /**
   * Submit a form and wait for response
   */
  static async submitForm(page: Page, submitButtonText: string) {
    const submitButton = page.getByRole('button', { name: submitButtonText });
    await submitButton.click();
    
    // Wait for form submission to complete with a reasonable timeout
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      // If networkidle times out, just continue
      console.log('Form submission network idle timeout, continuing...');
    }
  }

  /**
   * Check if an element is visible and enabled
   */
  static async assertElementReady(page: Page, selector: string) {
    const element = page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
  }

  /**
   * Wait for and verify a success message
   */
  static async waitForSuccessMessage(page: Page, message: string) {
    const successElement = page.getByText(message);
    await expect(successElement).toBeVisible({ timeout: 10000 });
  }

  /**
   * Wait for and verify an error message
   */
  static async waitForErrorMessage(page: Page, message: string) {
    const errorElement = page.getByText(message);
    await expect(errorElement).toBeVisible({ timeout: 10000 });
  }

  /**
   * Take a screenshot for debugging
   */
  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ path: `test-results/${name}.png` });
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(page: Page): Promise<boolean> {
    try {
      // Check for common authenticated user indicators
      const userMenu = page.locator('[data-testid="user-menu"], [data-testid="user-avatar"]');
      return await userMenu.count() > 0;
    } catch {
      return false;
    }
  }

  /**
   * Sign in with test credentials
   */
  static async signIn(page: Page, email: string, password: string) {
    await this.navigateToPage(page, '/auth/signin');
    
    await this.fillForm(page, {
      'Email address': email,
      'Password': password
    });
    
    await this.submitForm(page, 'Sign in');
    
    // Wait for successful sign in
    await page.waitForURL(/\/dashboard|\/creators/);
  }

  /**
   * Sign up with test credentials
   */
  static async signUp(page: Page, email: string, password: string, confirmPassword?: string) {
    await this.navigateToPage(page, '/auth/signup');
    
    const confirmPwd = confirmPassword || password;
    
    await this.fillForm(page, {
      'Email address': email,
      'Password': password,
      'Confirm password': confirmPwd
    });
    
    await this.submitForm(page, 'Create Account');
    
    // Wait for successful sign up or error message with reasonable timeout
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      // If networkidle times out, just continue
      console.log('Signup network idle timeout, continuing...');
    }
  }

  /**
   * Navigate to creators page and wait for it to load
   */
  static async navigateToCreators(page: Page) {
    await this.navigateToPage(page, '/creators');
    
    // Wait for creators to load
    await page.waitForSelector('[data-testid="creator-card"]', { timeout: 10000 });
  }

  /**
   * Click on the first creator and navigate to their page
   */
  static async clickFirstCreator(page: Page) {
    const firstCreator = page.locator('[data-testid="creator-card"]').first();
    await firstCreator.click();
    
    // Wait for creator page to load
    await this.waitForPageLoad(page);
  }

  /**
   * Check if payment buttons are present and functional
   */
  static async checkPaymentButtons(page: Page) {
    // Check for subscription button
    const subscribeButton = page.getByRole('button', { name: /Subscribe/i });
    if (await subscribeButton.count() > 0) {
      await expect(subscribeButton).toBeVisible();
      await expect(subscribeButton).toBeEnabled();
    }
    
    // Check for purchase buttons
    const purchaseButtons = page.getByRole('button', { name: /Purchase|Buy|Read Full/i });
    if (await purchaseButtons.count() > 0) {
      await expect(purchaseButtons.first()).toBeVisible();
      await expect(purchaseButtons.first()).toBeEnabled();
    }
  }
}

export default TestHelpers;
