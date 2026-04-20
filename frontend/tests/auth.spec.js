import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can login successfully and navigate to dashboard', async ({ page }) => {
    // Navigate to base URL (Home page)
    await page.goto('/');

    // Click on the login link from the Home page
    await page.getByRole('link', { name: /Explore Sessions/i }).click();
    await expect(page).toHaveURL(/.*login/i);

    // Assuming there is a login link or the homepage is the login page
    // Using common roles and placeholder texts
    
    // Fill in email
    const emailInput = page.getByPlaceholder('email@campus.com');
    // Fallback if placeholder is missing, e.g. using label
    if (await emailInput.count() === 0) {
      await page.getByLabel(/email/i).fill('malith07@gmail.com');
    } else {
      await emailInput.fill('malith07@gmail.com');
    }

    // Fill in password
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.count() === 0) {
      await page.getByLabel(/password/i).fill('Password@123');
    } else {
      await passwordInput.fill('Password@123');
    }

    // Click the login button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirection to the dashboard
    // We wait for a specific dashboard element to appear, or check the URL
    await expect(page).toHaveURL(/.*dashboard/i);
    
    // Verify an element that should only be on the dashboard
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Book a Session|Dashboard/i);
  });
});
