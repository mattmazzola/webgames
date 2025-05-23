import { test, expect } from '@playwright/test';

const datetimeStr = new Date().toISOString().slice(0, -4).replaceAll('-', '').replaceAll(':', '').replaceAll('.', '');
const screenshotDir = `test-screenshots/ladybird/${datetimeStr}`;

test('Ladybird game navigation and submission', async ({ page }) => {
    // Set viewpoert to inclue full game area
    await page.setViewportSize({ width: 650, height: 800 });

    // Navigate to the ladybird game
    await page.goto('https://webgames.convergence.ai/ladybird');

    // Wait for the page to load completely
    await page.waitForSelector('h1:has-text("LadyBird Planner")');

    // Take a screenshot of the initial game state
    await page.screenshot({ path: `${screenshotDir}/01_initial.png`, fullPage: true });

    // Press a sequence of directional buttons
    // Using the constants from the game: MOVE_DOWN = "⬇️", MOVE_RIGHT = "➡️", etc.

    // Press down button a couple of times
    const downButton = page.getByRole('button', { name: '⬇️' });
    await downButton.click();
    await downButton.click();

    // Press right button
    const rightButton = page.getByRole('button', { name: '➡️' });
    await rightButton.click();
    await rightButton.click();
    await rightButton.click();

    // Press down button again
    await downButton.click();
    await downButton.click();

    // Press right button again to reach the target
    await rightButton.click();
    await rightButton.click();
    await rightButton.click();

    // Take a screenshot of the input sequence before submitting
    await page.screenshot({ path: `${screenshotDir}/02_sequence.png`, fullPage: true });

    // Submit the solution
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await submitButton.click();

    // Take a screenshot of the result
    await page.screenshot({ path: `${screenshotDir}/03_result.png`, fullPage: true });

    // Check for success message or password display
    const resultMessage = page.locator('div.text-2xl');
    await expect(resultMessage).toBeVisible();
});
