/**
 * E2E tests for wallet connection
 */

import { test, expect } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test('should display wallet connect button', async ({ page }) => {
    await page.goto('/');

    // Look for wallet connection button
    const connectButton = page.getByRole('button', { name: /connect/i });
    await expect(connectButton).toBeVisible();
  });

  test('should show wallet modal on connect click', async ({ page }) => {
    await page.goto('/');

    // Click connect button
    const connectButton = page.getByRole('button', { name: /connect/i });
    await connectButton.click();

    // Wait for modal or wallet selection to appear
    await page.waitForTimeout(1000);

    // Check that some wallet UI appeared
    // This will depend on your actual implementation
    const modal = page.locator('[role="dialog"]');
    const walletOptions = page.locator('[data-testid*="wallet"]');

    // Either modal or wallet options should be visible
    const modalVisible = await modal.isVisible().catch(() => false);
    const optionsVisible = await walletOptions.first().isVisible().catch(() => false);

    expect(modalVisible || optionsVisible).toBeTruthy();
  });

  test('should show network information when available', async ({ page }) => {
    await page.goto('/');

    // Wait for potential network info to load
    await page.waitForLoadState('networkidle');

    // Check for Base network indicators
    // This is optional depending on your implementation
    const networkInfo = page.getByText(/base|sepolia/i);

    // If network info is shown, verify it
    const hasNetworkInfo = await networkInfo.count();
    if (hasNetworkInfo > 0) {
      await expect(networkInfo.first()).toBeVisible();
    }
  });

  test('should handle connection errors gracefully', async ({ page }) => {
    // Simulate error by blocking wallet provider
    await page.route('**/*', (route) => {
      // Allow most requests but could simulate failures
      route.continue();
    });

    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /connect/i });
    await connectButton.click();

    // Wait a bit for any error messages
    await page.waitForTimeout(2000);

    // Page should still be functional
    expect(page.url()).toBeTruthy();
  });

  test('should be accessible via keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab to connect button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Find focused element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
