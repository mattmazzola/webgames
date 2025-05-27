import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const datetimeStr = new Date().toISOString().slice(0, -4).replaceAll('-', '').replaceAll(':', '').replaceAll('.', '')
const screenshotDir = `test-screenshots/ladybird/${datetimeStr}`
const datasetDir = `datasets/ladybird/ladybird_${datetimeStr}`
const datasetImagesDir = `${datasetDir}/images`

let imageIndex = 1

test('Ladybird game navigation and submission', async ({ page }) => {

    // Create necessary directories
    await fs.promises.mkdir(screenshotDir, { recursive: true })
    await fs.promises.mkdir(datasetImagesDir, { recursive: true })

    // Set viewport to include full game area
    await page.setViewportSize({ width: 650, height: 800 })

    // Navigate to the ladybird game
    await page.goto('https://webgames.convergence.ai/ladybird')

    // Wait for the page to load completely
    await page.waitForSelector('h1:has-text("LadyBird Planner")')

    async function takeScreenshotAndCopy(imageName: string) {
        const imageIndexStr = imageIndex.toString().padStart(2, '0')
        const screenshotPath = `${screenshotDir}/${imageIndexStr}_${imageName}.png`
        const datasetImagePath = `${datasetImagesDir}/${imageIndexStr}_${imageName}.png`
        await page.screenshot({ path: screenshotPath, fullPage: true })
        await fs.promises.copyFile(screenshotPath, datasetImagePath)

        imageIndex += 1
    }

    // Take a screenshot of the initial game state
    await takeScreenshotAndCopy('initial')
    // Press a sequence of directional buttons
    // Using the constants from the game: MOVE_DOWN = "⬇️", MOVE_RIGHT = "➡️", etc.

    // Press down button a couple of times
    const downButton = page.getByRole('button', { name: '⬇️' })
    await downButton.click()
    await downButton.click()

    // Press right button
    const rightButton = page.getByRole('button', { name: '➡️' })
    await rightButton.click()
    await rightButton.click()
    await rightButton.click()

    // Press down button again
    await downButton.click()
    await downButton.click()

    // Press right button again to reach the target
    await rightButton.click()
    await rightButton.click()
    await rightButton.click()

    // Take a screenshot of the input sequence before submitting
    await takeScreenshotAndCopy('sequence')

    // Submit the solution
    const submitButton = page.getByRole('button', { name: 'Submit' })
    await submitButton.click()

    // Take a screenshot of the result after submitting
    await takeScreenshotAndCopy('result')

    // Check for success message or password display
    const resultMessage = page.locator('div.text-2xl')
    await expect(resultMessage).toBeVisible()

    // Get image path relative to datasetDir
    const imagePaths = fs.readdirSync(datasetImagesDir).map(file => path.join('images', file))
    const dataItem = {
        "images": imagePaths,
        "start_pos": [],
        "end_pos": [],
        "paths": [],
    }

    // Write game data to dataset.jsonl file
    const datasetJsonlPath = path.join(datasetDir, 'dataset.jsonl')
    await fs.promises.writeFile(datasetJsonlPath, JSON.stringify(dataItem) + '\n')
})
