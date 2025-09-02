import { test, expect } from '@playwright/test';

test.describe('FHIR PIT Application', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page title contains FHIR
    await expect(page).toHaveTitle(/FHIR/);
    
    // Check for main navigation or content
    // This is a basic test - you can expand this based on your app structure
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to different sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test navigation - adjust selectors based on your actual app structure
    // These are examples - you'll need to update them based on your app
    
    // Look for common Angular Material elements or your specific navigation
    const navigation = page.locator('mat-toolbar, nav, .navigation, [role="navigation"]').first();
    if (await navigation.isVisible()) {
      await expect(navigation).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that the page still works on mobile
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(body).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(body).toBeVisible();
  });
});