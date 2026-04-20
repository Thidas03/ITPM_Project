import { test, expect } from '@playwright/test';

test.describe('Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('email@campus.com').fill('malith07@gmail.com');
    await page.locator('input[type="password"]').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*dashboard/i);
  });

  test('User can view session details', async ({ page }) => {
    // Verify sessions are displayed (at least one 'View Details' button exists)
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 15000, message: "No available sessions found." });

    // Click on a session
    await viewDetailsBtn.click();

    // Verify session details modal opens by checking its heading
    const sessionModalHeading = page.getByRole('heading', { name: /Session Details/i });
    await expect(sessionModalHeading).toBeVisible({ timeout: 15000 });
  });
});
