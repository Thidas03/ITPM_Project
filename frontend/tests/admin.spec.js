import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Flow', () => {
  test('Admin can login and navigate to dashboard', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Fill in admin credentials
    await page.getByPlaceholder('email@campus.com').fill('eric06@gmail.com');
    await page.locator('input[type="password"]').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirection to admin dashboard
    await expect(page).toHaveURL(/.*admin.*/i);

    // Verify admin dashboard heading is visible
    const adminHeading = page.getByText(/System-wide administrative control panel/i);
    await expect(adminHeading).toBeVisible();

    // Verify analytics/stats cards are displayed (e.g., Total Users)
    const totalUsersStat = page.getByText(/Total Users/i).first();
    await expect(totalUsersStat).toBeVisible();
  });
});
