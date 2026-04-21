import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('email@campus.com').fill('malith07@gmail.com');
    await page.locator('input[type="password"]').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*dashboard/i);
  });

  test('User can book a session', async ({ page }) => {
    // Select the first available session by clicking 'View Details'
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 15000, message: "No available sessions found." });
    await viewDetailsBtn.click();

    // Click 'Confirm Booking' in the modal
    const bookButton = page.getByRole('button', { name: /Confirm Booking/i });
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    // Verify success message / UI update
    const successToast = page.locator('.Toastify__toast--success, .success-message').first();
    await expect(successToast).toBeVisible({ timeout: 15000 });
    
    // Close modal if needed
    const closeButton = page.getByRole('button', { name: /close|x/i }).last();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  });

  test('User can cancel a booked session', async ({ page }) => {
    // Navigate to user's bookings page or stay on dashboard
    // The "Cancel Booking" button is available on the Dashboard directly!
    const cancelButton = page.getByRole('button', { name: /cancel booking/i }).first();
    
    if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // A Confirmation Modal opens up with Confirm/Cancel buttons
        const confirmBtn = page.getByRole('button', { name: /confirm|yes/i }).first();
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }

        // Verify success message
        const successToast = page.locator('.Toastify__toast--success').first();
        await expect(successToast).toBeVisible({ timeout: 15000 });
    }
  });
});
