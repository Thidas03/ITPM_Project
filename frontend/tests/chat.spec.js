import { test, expect } from '@playwright/test';

test.describe('Chat Feature Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('email@campus.com').fill('malith07@gmail.com');
    await page.locator('input[type="password"]').fill('Password@123');
    await page.getByRole('button', { name: /sign in/i }).click();
  });

  test('User can send and read messages in the chat', async ({ page }) => {
    // Wait for the Dashboard to load fully
    await expect(page).toHaveURL(/.*dashboard/i);

    // Look for the "Open Chat" button. 
    // Note: This relies on the student having at least one booked session.
    const openChatBtn = page.getByRole('button', { name: /open chat/i }).first();
    
    // Check if the button is visible. If not, the test should fail gracefully or prompt to book first.
    await expect(openChatBtn).toBeVisible({ timeout: 15000, message: "No booked sessions found with an Open Chat button. Please book a session first to test chat." });
    await openChatBtn.click();

    // Send a message
    const testMessage = `Hello this is a test message ${Date.now()}`;
    const chatInput = page.getByPlaceholder(/type a message/i);
    await expect(chatInput).toBeVisible();
    await chatInput.fill(testMessage);

    // Click the send button (it doesn't have "Send" text, it's an icon in a submit button)
    await page.locator('form button[type="submit"]').click();

    // Verify message appears in chat window
    // the max-w-[80%] rounded-2xl div contains the message
    await expect(page.getByText(testMessage)).toBeVisible();
  });
});
