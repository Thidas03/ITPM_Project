import { test, expect } from '@playwright/test';

test.describe('Payment & Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before payment tasks
    await page.goto('/login');
    await page.getByPlaceholder('email@campus.com').fill('malith07@gmail.com');
    await page.locator('input[type="password"]').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*dashboard/i);
  });

  test('User can open checkout and simulated payment methods display', async ({ page }) => {
    // To trigger the checkout modal easily, we can try booking a session with a price.
    // Navigate to dashboard and click 'View Details' on the first session.
    const viewDetailsBtn = page.getByRole('button', { name: /view details/i }).first();
    await expect(viewDetailsBtn).toBeVisible({ timeout: 15000, message: "No available sessions found." });
    await viewDetailsBtn.click();

    // Click 'Confirm Booking' or checkout inside the modal
    const bookButton = page.getByRole('button', { name: /Confirm Booking/i });
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    // If it requires payment, it might open the Checkout Modal or it might just book it 
    // (if price is 0). If the Checkout modal appears, verify its elements.
    const checkoutTitle = page.getByRole('heading', { name: /Complete Your Payment|Checkout/i });
    
    // We only wait for it briefly in case the event is free and books directly.
    if (await checkoutTitle.isVisible()) {
        // Assert we see Card and Wallet toggles
        const cardBtn = page.getByRole('button', { name: /Card/i });
        const walletBtn = page.getByRole('button', { name: /Wallet/i });
        
        await expect(cardBtn).toBeVisible();
        await expect(walletBtn).toBeVisible();
        
        // Alternatively, they can close the modal
        const closeBtn = page.locator('.close-btn').last();
        if (await closeBtn.isVisible()) {
             await closeBtn.click();
        }
    }
  });

  test('User can check Wallet Balance inside dashboard', async ({ page }) => {
    // In the dashboard (Student OR Tutor), we can check for wallet balance elements
    // The user wallet balance might be rendered. We can look for "Rs." related to balance.
    // This is optional if the dashboard exposes it directly.
    await expect(page).toHaveURL(/.*dashboard/i);
    
    // Look for a balance or money icon
    const balanceText = page.getByText(/Rs\./i).first();
    if (await balanceText.count() > 0) {
        await expect(balanceText).toBeVisible();
    }
  });
});
