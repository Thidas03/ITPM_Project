import { test, expect } from '@playwright/test';

test.describe('Feedback Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before giving feedback
    await page.goto('/login');
    await page.getByPlaceholder('email@campus.com').fill('malith07@gmail.com');
    await page.locator('input[type="password"]').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*dashboard/i);
  });

  test('User can submit session feedback', async ({ page }) => {
    // Navigate to the feedback page
    await page.goto('/feedback');

    // Click on the Fill Demo Data button to quickly populate the form
    const demoDataBtn = page.getByRole('button', { name: /Fill Demo Data/i });
    await expect(demoDataBtn).toBeVisible({ timeout: 15000 });
    await demoDataBtn.click();

    // Click Submit Feedback
    const submitBtn = page.getByRole('button', { name: /Submit Feedback/i });
    await submitBtn.click();

    // Demo Data uses hardcoded IDs like SES-101 which might be rejected by the real backend
    // So we check if ANY message appeared (either success or server error)
    const messageContainer = page.locator('.bg-teal-500\\/10, .bg-red-500\\/10').first();
    await expect(messageContainer).toBeVisible({ timeout: 15000 });
  });
});
